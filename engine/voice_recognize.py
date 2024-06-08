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

load_dotenv(find_dotenv())
dir_file = os.getenv("FILE_DIR")

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

def convert_to_wav(input_file, output_file):
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


def return_phrase_audio():
    logging.info("Chamou start_listening ")
    logging.info('Metodo start_listening vai chamar transcribe_audio_file.')
    response_final = transcribe_audio()
    logging.info("Terminou a chamada do transcribe_audio dentro do metodo return_phrase_audio")
    return response_final

def transcribe_audio():
    # Use the speech_recognition library to transcribe the audio
    convert_to_wav('audio.wav', 'output_file.wav')
    recognizer = sr.Recognizer()
    with sr.AudioFile(os.path.join(dir_file, "engine", "output_file.wav")) as source:
        audio = recognizer.record(source)  # read the entire audio file
        try:
            # recognize speech using Google Web Speech API, with language set to English
            text = recognizer.recognize_google(audio, language="en-US")
            print("Transcription: " + text)
            return text
        except sr.UnknownValueError:
            print("Google Web Speech could not understand the audio")
        except sr.RequestError as e:
            print("Could not request results from Google Web Speech; {0}".format(e))
