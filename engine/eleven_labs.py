from elevenlabs import generate, play, voices, set_api_key, save, User, Voice, VoiceSettings
import elevenlabs
import logging
import os
from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv())
dir_file = os.getenv("FILE_DIR")

if dir_file is not None:
    filename = os.path.join(dir_file, "data", "app.log")
else:
    filename = "app/app.log"

logging.basicConfig(filename=filename, level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

chave_eleven = "79a25f2750027c8bb669ea213e4164c2"
set_api_key(chave_eleven)

def generate_audio_eleven_labs(text):
    stability = 0.65
    similarity_boost = 0.8
    style = 0.55
    boost = False

    logging.info("It will generate audio with text: " + text)
    audio = generate(
        text=text,
        voice=Voice(voice_id="ErXwobaYiN019PkySvjV",
                    settings=VoiceSettings(stability=stability,
                                           similarity_boost=similarity_boost,
                                           style=style,
                                           use_speaker_boost=boost)),
        model='eleven_multilingual_v2'
    )

    filename = "./engine/response_open_ai.mp3"
    logging.info("File to be generated: " + filename)

    # Salvando o áudio com with open
    with open(filename, 'wb') as file:
        file.write(audio)
        logging.info("Audio file saved successfully.")
