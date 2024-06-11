import os
import wave
from vosk import Model, KaldiRecognizer
import json
import subprocess
import logging
from pydub import AudioSegment
from pydub.silence import split_on_silence
from engine.prompt import prompt_question
from engine.eleven_labs import generate_audio_eleven_labs
from dotenv import load_dotenv, find_dotenv
import speech_recognition as sr
import openai

load_dotenv(find_dotenv())
dir_file = os.getenv("FILE_DIR")
openai.api_key = os.getenv("OPENAI_API_KEY")
if dir_file is not None:
    filename = os.path.join(dir_file, "data", "app.log")
else:
    filename = "app/data/app.log"

logging.basicConfig(filename=filename, level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def start_listening():
    logging.info("Chamou start_listening ")
    logging.info('Metodo start_listening vai chamar transcribe_audio')
    response_final = transcribe_audio()
    logging.info("Terminou a chamada do transcribe_audio_file dentro do metodo start_listening")
    return response_final

async def convert_to_wav(input_file, output_file):
    logging.info(" input  file ")
    logging.info(os.path.join(dir_file, "engine", input_file))
    logging.info(" output file ")
    logging.info(os.path.join(dir_file, "engine", output_file))
    input_audio_path = os.path.join(dir_file, "engine", input_file)
    output_audio_path = os.path.join(dir_file, "engine", output_file)

    audio = AudioSegment.from_file(input_audio_path)
    logging.info(" Chamou AudioSegment.from_file ")
    audio = audio.set_frame_rate(16000)
    audio = audio.set_channels(1)  # Converte para mono
    audio = audio.set_sample_width(2)  # Define largura de amostra para 16 bits
    audio.export(output_audio_path, format="wav")

    logging.info("Converteu o arquivo .wav com supressão de ruído!")

def ask_open_ai(phrases):
    logging.info("Metodo ask_open_ai.")
    response = prompt_question(" ".join(phrases))
    logging.info(f'response {str(response)}')
    return response

async def return_phrase_audio(uuid):
    logging.info("Chamou start_listening ")
    logging.info('Metodo start_listening vai chamar transcribe_audio_file.')
    response_final = await transcribe_audio(uuid)
    logging.info("Terminou a chamada do transcribe_audio dentro do metodo return_phrase_audio")
    return response_final

async def transcribe_audio(uuid):
    # await convert_to_wav('audio.wav', 'output_file.wav')
    with open(os.path.join(dir_file, "engine", f'audio_{uuid}.wav'), 'rb') as audio_file:
        response = openai.Audio.transcribe(
            model="whisper-1",
            file=audio_file,
            response_format="text",
            language="en"
        )
    return response

