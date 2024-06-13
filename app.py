import os
import platform
import requests
from flask import Flask, render_template, request, jsonify, send_from_directory, abort, make_response, session, redirect, Response
from werkzeug.utils import secure_filename
from flask_cors import CORS
import speech_recognition as sr
from engine.voice_recognize import start_listening, return_phrase_audio, return_phrase_cc_audio
import asyncio
import logging
import time
import json
from flask_caching import Cache
from dotenv import load_dotenv, find_dotenv
from engine.eleven_labs import generate_audio_eleven_labs, cc_generate_audio_eleven_labs
from flask_session import Session
from flask_talisman import Talisman
import openai
from elevenlabs import generate, play, voices, set_api_key, save, User, Voice, VoiceSettings
import elevenlabs
from engine.prompt import  evaluate_question, prompt_english_evaluate
from datetime import datetime

load_dotenv(find_dotenv())
dir_file = os.getenv("FILE_DIR")
if dir_file is not None:
    filename = os.path.join(dir_file, "data", "app.log")
else:
    filename = "app/app.log"

logging.basicConfig(filename=filename, level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SECURE'] = True  # Certifique-se de usar HTTPS em produção
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True
app.config['CACHE_TYPE'] = 'simple'  # Pode usar diferentes tipos de cache como 'redis', 'memcached', etc.
app.config['CACHE_TYPE'] = 'simple'  # Pode usar diferentes tipos de cache como 'redis', 'memcached', etc.
CORS(app, resources={r"/*": {"origins": "*"}})

cache = Cache(app)
Session(app)
csp = {
    'default-src': [
        '\'self\'',
        'https://stackpath.bootstrapcdn.com',
        'https://cdnjs.cloudflare.com',
        'https://code.jquery.com',
        'https://cdn.jsdelivr.net',
        'https://ajax.googleapis.com',
    ],
    'style-src': [
        '\'self\'',
        'https://stackpath.bootstrapcdn.com',
        'https://cdnjs.cloudflare.com',
    ],
    'script-src': [
        '\'self\'',
        'https://stackpath.bootstrapcdn.com',
        'https://cdnjs.cloudflare.com',
        'https://code.jquery.com',
        'https://cdn.jsdelivr.net',
        'https://ajax.googleapis.com',
    ],
    'img-src': [
        '\'self\'',
        'data:',
    ],
    'font-src': [
        '\'self\'',
        'https://cdnjs.cloudflare.com',
    ],
}

Talisman(app, content_security_policy=None)


MP3_DIR = "/home/ubuntu22/PycharmProjects/usmart_interview/engine"
data = ["string1", "string2", "string3"]

@app.route('/questoes/<topics>')
def get_questions(topics):

    logging.info("Fetching data from the API...")
    try:
        response = requests.get(f'http://127.0.0.1:8000/questions/{topics}')
        response.raise_for_status()
        data = response.json()

        # questions_dict = {index: item['question'] for index, item in enumerate(data)}

        return jsonify(data), 200
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching data: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/fetch_student_interviews/<int:id_student>', methods=['GET'])
def fetch_student_interviews(id_student):
    url = f'http://127.0.0.1:8000/student_interviews/{id_student}'

    try:
        response = requests.get(url)
        response.raise_for_status()  # Levanta uma exceção para status de erro HTTP
        interviews = response.json()
        return jsonify(interviews)
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

@app.route('/fetch_questions_interviews/<int:id_interview>', methods=['GET'])
def fetch_questions_interviews(id_interview):
    url = f'http://127.0.0.1:8000/interview_questions/{id_interview}'
    try:
        response = requests.get(url)
        response.raise_for_status()
        questions = response.json()
        return jsonify(questions)
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

@app.route('/student/<email>')
@cache.cached(timeout=3600)  # Cache por 1 hora (3600 segundos)
def get_student(email):
    cache_key = 'get_student'
    cached_data = cache.get(cache_key)

    if cached_data:
        logging.info("Serving data from the cache.")
        return jsonify(cached_data), 200

    logging.info("Fetching data from the API...")
    try:
        response = requests.get(f'http://127.0.0.1:8000/student/{email}')
        response.raise_for_status()
        data = response.json()

        # Transformar o JSON em um dicionário com índice e question
        student_dict = data

        # Armazenar o resultado transformado no cache
        cache.set(cache_key, student_dict, timeout=3600)

        return jsonify(student_dict), 200
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching data: {e}")
        return jsonify({'error': str(e)}), 500



@app.route('/audio/<filename>')
def get_audio(filename):
    filename = secure_filename(filename)
    safe_path = os.path.join(MP3_DIR, filename)
    if os.path.exists(safe_path):
        return send_from_directory(MP3_DIR, filename)
    abort(404)

@app.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    logging.info(response)
    return response

@app.route('/start/<user_id>')
def start(user_id):
    message = start_listening()
    logging.info( "Valor de message no metodo start " + message)
    return jsonify({'message': message})

@app.route('/stop/<user_id>')
def stop(user_id):
    logging.info("Chamou o endpoint de stop")
    # message =  await stop_listening()
    # print(message)
    return jsonify({'message': 'teste'})

@app.route("/")
def modelo():
    minha_lista = ["maçã", "banana", "cereja", "damasco"]
    return render_template("index.html", minha_lista=minha_lista)

@app.route("/algorithm")
def algorithm():
    minha_lista = ["maçã", "banana", "cereja", "damasco"]
    return render_template("algorithm.html", minha_lista=minha_lista)


@app.route('/save-audio', methods=['POST'])
def save_audio():
    try:
        # Verificar se um arquivo de áudio foi enviado no corpo da requisição
        if 'audio' in request.files and 'currentQuestion' in request.form:
            audio_file = request.files['audio']
            currentQuestion = request.form['currentQuestion']

            audio_file_path = os.path.join(str(dir_file), "engine", "audio.wav")
            audio_file.save(audio_file_path)
            logging.info("Salvou o arquivo !")
            logging.info(f'Pergunta corrente: {currentQuestion}')
            frase_retorno = start_listening()
            logging.info('Gerando frase de retorno no metodo save_audio.')
            logging.info(frase_retorno)

            return jsonify({'frase': frase_retorno}), 200
        else:
            logging.error('Nenhum arquivo de áudio ou pergunta anterior foi enviado.')
            return 'Nenhum arquivo de áudio ou pergunta anterior foi enviado.', 400
    except Exception as e:
        logging.error(f'Erro {str(e)}')
        return f'Erro ao salvar o arquivo de áudio: {str(e)}', 500

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")

@app.route("/cadastro_pergunta")
def cadastro_pergunta():
    return render_template("cadastro_pergunta.html")

@app.route("/cadastro_entrevista")
def cadastro_entrevista():
    return render_template("cadastro_entrevista.html")

@app.route('/generate_question/<uuid>', methods=['POST'])
def generate_question(uuid):
    # generate_audio_eleven_labs(question, uuid)
    data = request.get_json()
    question = data.get('question')

    return jsonify({"message": f"Question '{question.get('question')}' processed successfully."})

@app.route('/clear_cache')
def clear_cache():
    cache.clear()
    return "Cache cleared!"

@app.route('/cache_info')
def cache_info():
    # Esta função pode variar dependendo do tipo de backend de cache que você está usando.
    # Para um cache simples, não há uma maneira fácil de visualizar o conteúdo, mas para
    # caches mais robustos como Redis, você pode usar ferramentas específicas.
    return "Cache info not available for simple cache type."

@app.route('/process_answer/<uuid>', methods=['POST'])
async def process_answer(uuid):
    try:
        # Verificar se um arquivo de áudio foi enviado no corpo da requisição
        if 'audio' in request.files and 'currentQuestion' in request.form:
            audio_file = request.files['audio']
            currentQuestion = json.loads(request.form['currentQuestion'])
            previousQuestion = json.loads(request.form['previousQuestion'])

            audio_file_path = os.path.join(str(dir_file), "engine", f'audio_{uuid}.wav')
            audio_file.save(audio_file_path)
            logging.info("Salvou o arquivo !")
            logging.info(f'Pergunta anterior: {previousQuestion}')
            current_question = currentQuestion.get('question')
            logging.info(f'Pergunta corrente: {currentQuestion}')
            frase_retorno = await return_phrase_audio(uuid)
            logging.info('Gerando frase de retorno no metodo save_audio.')
            logging.info(frase_retorno)
            feedback = await evaluate_question(previousQuestion.get('question'), previousQuestion.get('ideal_answer'), frase_retorno )
            # english =  await prompt_english_evaluate(frase_retorno)
            # feedback_dict = json.loads(feedback)
            # feedback_dict['english'] = english  # Adicione o atributo 'english'

            # Retorne o JSON atualizado com o novo atributo 'english'
            return jsonify({'frase': f'{current_question}'}), 200
        else:
            logging.error('Nenhum arquivo de áudio ou pergunta anterior foi enviado.')
            return 'Nenhum arquivo de áudio ou pergunta anterior foi enviado.', 400
    except Exception as e:
        logging.error(f'Erro {str(e)}')
        return f'Erro ao salvar o arquivo de áudio: {str(e)}', 500

@app.route('/create_interview', methods=['POST'])
def create_interview():

    stack = request.form['stack']
    session['stack'] = stack

    current_datetime = datetime.now().strftime('%Y-%m-%dT%H:%M:%S')

    dados = {
        "id_student": 34,
        "interview_date": current_datetime,
        "stack": stack,
        "data_atualizacao": current_datetime,
        "score": 0
    }

    url = 'http://127.0.0.1:8000/interview'

    try:
        response = requests.post(url, json=dados)
        response.raise_for_status()  # Isso irá levantar um erro para códigos de status HTTP 4xx/5xx

        if request.method == 'POST':
            interview = json.loads(response.content)
            session['id_interview'] = interview.get('id_interview')
        return render_template('index.html', stack=stack, id_interview = id_interview )

    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500


@app.route('/crackingcode')
def crackingcode():
    return render_template('algorithm.html')


def calculate_total_tokens(messages):
    return sum(len(message['content'].split()) for message in messages)


@app.route('/chat/<uuid>', methods=['POST'])
def chat(uuid):
    user_input = request.json.get('message')

    # Recupera o histórico da conversa da sessão do usuário
    if 'chat_history' not in session:
        session['chat_history'] = []

    chat_history = session['chat_history']

    # Template de prompt para o sistema
    prompt_template = """
        You are a polite interviewer you must using a maximum of 20 words, ask how he can solve the following algorithm(
        Given an interval newInterval and an array of intervals, create a function that inserts that newInterval in the array,
        and to merge if necessary. Note that the intervals in the array are non-overlapping, and are
        sorted according to their starting point.
        Example 1:
        Input: intervals = [[1, 3], [4, 7], [8, 10], [12, 15], [16, 17], [18, 20], [21, 25], [28, 29]], newInterval = [9, 18]
        Output: [[1, 3], [4, 7], [8, 20], [21, 25], [28, 29]] )
        Observation:
        Remember to use few words when asking.
        .
    """
    messages = [{"role": "system", "content": prompt_template}]

    # Adiciona o histórico da conversa
    for message in chat_history:
        role, content = message.split(": ", 1)
        if role.lower() == 'user':
            messages.append({"role": "user", "content": content})
        else:
            messages.append({"role": "assistant", "content": content})

    # Adiciona a nova mensagem do usuário
    messages.append({"role": "user", "content": user_input})

    # Envia a conversa para o modelo
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages,
        temperature=0.7
    )
    response_text = response['choices'][0]['message']['content'].strip()

    # Verificar se a resposta foi cortada
    if response['choices'][0]['finish_reason'] == 'length':
        continuation_prompt = "Please continue from where you left off."
        messages.append({"role": "assistant", "content": response_text})
        messages.append({"role": "user", "content": continuation_prompt})
        continuation_response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=100,  # Define o limite de tokens para a resposta
            temperature=0.7
        )
        response_text += " " + continuation_response['choices'][0]['message']['content'].strip()

    # cc_generate_audio_eleven_labs(response_text, uuid)

    # Adiciona a nova mensagem ao histórico da sessão
    chat_history.append(f"user: {user_input}")
    chat_history.append(f"assistant: {response_text}")

    # Mantém o histórico dentro de um limite de tokens
    total_tokens = calculate_total_tokens(messages)
    max_total_tokens = 2000  # Ajuste conforme necessário
    while total_tokens > max_total_tokens and chat_history:
        chat_history.pop(0)
        total_tokens = calculate_total_tokens(messages)

    # Salva o histórico atualizado na sessão do usuário
    session['chat_history'] = chat_history
    logging.info(response_text)
    return jsonify({'response': response_text, 'question': user_input})

@app.route('/process_answer_cracking_code/<uuid>', methods=['POST'])
async def process_answer_cracking_code(uuid):
    try:
        # Verificar se um arquivo de áudio foi enviado no corpo da requisição
        if 'audio' in request.files  :
            audio_file = request.files['audio']
            code = request.form.get('code')
            audio_file_path = os.path.join(str(dir_file), "engine", f'cc_audio_{uuid}.wav')
            audio_file.save(audio_file_path)
            logging.info("Salvou o arquivo !")
            frase_retorno = await return_phrase_cc_audio(uuid)
            logging.info('Gerando frase de retorno no metodo save_audio.')
            logging.info(frase_retorno)
            response_dict = await process_student_answer(frase_retorno, code)
            response_json = response_dict.get_json()
            response_value = response_json.get('response')

            # cc_generate_audio_eleven_labs(response_value, uuid)

            return response_dict  # jsonify({'frase': "How to break a Monolith web service into Microservices?"}), 200
        else:
            logging.error('Nenhum arquivo de áudio ou pergunta anterior foi enviado.')
            return 'Nenhum arquivo de áudio ou pergunta anterior foi enviado.', 400
    except Exception as e:
        logging.error(f'Erro {str(e)}')
        return f'Erro ao salvar o arquivo de áudio: {str(e)}', 500

async def process_student_answer(user_input, code):
    prompt_template = """
        You are an interviewer who assesses the user who must solve in Java the following algorithm:        
        Given an interval newInterval and an array of intervals, create a function that inserts that newInterval in the array,
        and to merge if necessary. Note that the intervals in the array are non-overlapping, and are
        sorted according to their starting point.
        Example 1:
        Input: intervals = [[1, 3], [4, 7], [8, 10], [12, 15], [16, 17], [18, 20], [21, 25], [28, 29]], newInterval = [9, 18]
        Output: [[1, 3], [4, 7], [8, 20], [21, 25], [28, 29]] """

    if code:
        prompt_template += f"""
        Important:
        Respond with up to 25 words and short phrase. 
        Don`t tell how to solve the problem, just evaluate the user code
        You must interact with the user input {user_input} and check errors and best practices over updated Java code {code}
        """

    messages = [{"role": "system", "content": prompt_template}]

    messages.append({"role": "user", "content": user_input})

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages
    )
    response_text = response['choices'][0]['message']['content'].strip()

    logging.info(response_text)
    return jsonify({'response': response_text, 'question': user_input})

API_KEY = '79a25f2750027c8bb669ea213e4164c2'
VOICE_ID = 'ErXwobaYiN019PkySvjV'
API_URL = f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}/stream'

def generate_stream(text):
    payload = {
        "text": text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            "stability": 0.75,
            "similarity_boost": 0.75,
            "style": 0,
            "use_speaker_boost": True
        }
    }

    headers = {
        "Content-Type": "application/json",
        "xi-api-key": f"{API_KEY}"
    }

    response = requests.post(API_URL, json=payload, headers=headers, stream=True)
    print("Response Status:", response.status_code)
    print("Response Text:", response.text)

    if response.status_code == 200:
        return response.iter_content(chunk_size=1024)
    else:
        return None

def split_text(text, max_length=500):
    words = text.split()
    chunks = []
    chunk = []

    for word in words:
        if len(' '.join(chunk + [word])) > max_length:
            chunks.append(' '.join(chunk))
            chunk = [word]
        else:
            chunk.append(word)

    if chunk:
        chunks.append(' '.join(chunk))

    return chunks


@app.route('/stream/<text>')
def stream_audio(text):
    text_to_speak = text
    def generate():
        audio_stream = generate_stream(text_to_speak)
        if audio_stream:
            for chunk_data in audio_stream:
                yield chunk_data

    return Response(generate(), content_type='audio/mpeg')


if __name__ == "__main__":
    cache = Cache(app, config={'CACHE_TYPE': 'simple'})
    # app.run(host='127.0.0.1', port=5000, debug=True, use_reloader=False)
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)

