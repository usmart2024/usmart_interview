import openai
import os
from langchain.llms import OpenAI
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv, find_dotenv
from langchain.output_parsers import CommaSeparatedListOutputParser, ResponseSchema, StructuredOutputParser
load_dotenv(find_dotenv())
from flask import jsonify
import asyncio
openai.api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
llm = OpenAI(temperature=0.1 )
from langchain.chains import LLMChain

def prompt_question(question):

    prompt_template = f"You are an interviewer, and must to a question about Java programming."
    messages = [{"role":"system", "content": prompt_template}]
    messages.append({
                        "role": "user",
                        "content": question
                        })
    res = openai.ChatCompletion.create(
        model="gpt-4",
        messages=messages,

    )

    return res.choices[0].message.content

def prompt_ask_candidate(query):

    prompt = PromptTemplate(
        template=" You are an interviewer and need to formulate a question, "
                 " using different words, based on the given question: {query}, "
                 " You cannot provide an answer if a question is asked to you. Your personality will be: friendly. ",
        input_variables=["query"]
    )

    prompt =  prompt.format(query= query)
    output = llm(prompt)
    print(output)

async def prompt_english_evaluate(phrase):

    prompt = PromptTemplate(
        template=" You are an english teacher and you need analize the english error of the following phrase {phrase}, Give a brief feedback",
        input_variables=["phrase"]
    )

    prompt =  prompt.format(phrase= phrase)
    output = llm(prompt)
    print(output)
    return output

import json

import json
from langchain.prompts import PromptTemplate
from langchain.output_parsers import ResponseSchema, StructuredOutputParser

import json
from langchain.prompts import PromptTemplate
from langchain.output_parsers import ResponseSchema, StructuredOutputParser

async def evaluate_question(question, question_answer, student_answer):
    prompt_template = """
    You are a tech lead knowledgeable in various technologies. Your role is to analyze 
    the student_answer against question_answer
    Now here you go the question {question} , question_answer : {question_answer}
    and student_answer {student_answer} 
    Compare the student_answer and question_answer and put the result in technical_feedback.
    Now you need set a score from 0 to 10 of the analisys and put result inside variable score.
    Now Evaluate only the English  in the phrase : {student_answer}  and provide suggestions for improvement. 
    This feedback will be assigned to the variable english_feedback.
 
    *** Output ***
    The result of this prompt must always be the JSON, as I am parsing the return as a JSON. If you return phrases, I will encounter errors during parsing,
    so only return the JSON.    
    
    Format example :
    "technical_feedback": "",
    "score": "",
    "english_feedback": ""
         
    """

    # Formatar o prompt com os valores das variáveis
    prompt = prompt_template.format(question=question, question_answer=question_answer, student_answer=student_answer)

    # Criar a mensagem para o modelo GPT-4
    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": prompt}
    ]

    # Chamada à API do OpenAI para completar o chat
    res = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages,
        temperature=0.7
    )

    json_string = res.choices[0].message['content']
    cleaned_output = clean_json_string(json_string)

    return cleaned_output

def clean_json_string(json_string):
    json_string = json_string.strip()
    # Remove ```json do início, se existir
    if json_string.startswith("```json"):
        json_string = json_string[7:].strip()

    if json_string.endswith("```"):
        json_string = json_string[:-3].strip()

    return json.loads(json_string)

# for _ in range(100):
#     result = evaluate_question(question, question_answer, student_answer)
#     print(result)