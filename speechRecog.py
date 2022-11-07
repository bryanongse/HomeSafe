from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC
import numpy as np
import torch
import pydub 

import pyttsx3
import speech_recognition as sr

##### Speech to Text Var
r = sr.Recognizer()
engine = pyttsx3.init()

def speechToText(filename):
    with sr.AudioFile(filename) as source:
        audio_data = r.record(source)
        text = r.recognize_google(audio_data)
        return text

if __name__ == "__main__":
    speechToText(r"C:\Users\bryan\Downloads\Recording (64).wav")