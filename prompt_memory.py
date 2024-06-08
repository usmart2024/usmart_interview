from flask import Flask, request, render_template, jsonify, session
from flask_session import Session
from flask_talisman import Talisman
from langchain.llms import OpenAI
from dotenv import load_dotenv, find_dotenv
import os
import openai
print("random")
print(os.urandom(24))
load_dotenv(find_dotenv())

app = Flask(__name__)
app.config['SECRET_KEY'] = '\x9c\xb9\xcf\x0b\x83q\xf0\x08\x9b\x17[/\nD\xcd\xde\xb9\xf6\x94]\x0b\xcc..'  # Use uma chave secreta forte
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SECURE'] = True  # Certifique-se de usar HTTPS em produção
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True
Session(app)
Talisman(app)
openai.api_key = os.getenv("OPENAI_API_KEY")
llm = OpenAI(api_key=openai.api_key)



@app.route('/crackingcode')
def index():
    return render_template('chat.html')


@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get('message')

    # Recupera o histórico da conversa da sessão do usuário
    if 'chat_history' not in session:
        session['chat_history'] = []

    chat_history = session['chat_history']

    # Template de prompt para o sistema
    prompt_template = "You are an interviewer, and must ask a question about Java programming."
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
    )
    response_text = response['choices'][0]['message']['content'].strip()

    # Adiciona a nova mensagem ao histórico da sessão
    chat_history.append(f"user: {user_input}")
    chat_history.append(f"assistant: {response_text}")

    # Salva o histórico atualizado na sessão do usuário
    session['chat_history'] = chat_history

    return jsonify({'response': response_text})


if __name__ == '__main__':
    app.run(debug=True)