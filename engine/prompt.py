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


async def evaluate_question(question, ideal_answer, answer):
    response_schemas = [
        ResponseSchema(name="question", description="question for the candidate"),
        ResponseSchema(name="ideal_answer", description="Candidate's expected answer"),
        ResponseSchema(name="answer", description="Candidate's provided answer"),
        ResponseSchema(name="technical_feedback", description="Feedback for the provided_answer against expected_answer"),
        ResponseSchema(name="score", description="Evaluate provided_answer against expected_answer with score from 0 to 10"),
        ResponseSchema(name="english_feedback", description="English Feedback for the answer")
    ]

    output_parser = StructuredOutputParser.from_response_schemas(response_schemas)
    format_instructions = output_parser.get_format_instructions()

    prompt = PromptTemplate(
        template="You are a software engineer knowledgeable in various technologies. Your role is to analyze "
                 "the answer against ideal_answer : {ideal_answer}. "
                 "Compare the answer and ideal_answer and respond in the JSON format "
                 "Respond in the format \n{format_instructions}. Now here you go the question {question}, ideal_answer {ideal_answer}, "
                 "and answer {answer}.you also need analize the english error of the following phrase {answer}, giving a brief english feedback ",
        input_variables=["question", "ideal_answer", "answer"],
        partial_variables={"format_instructions": format_instructions}
    )

    formatted_prompt = prompt.format(question=question, ideal_answer=ideal_answer, answer=answer)
    output = llm(formatted_prompt)  # Assuming llm is an async function

    # Log the output received from the LLM
    print(f"Output from LLM: {output}")

    # Clean up the output to remove ```json and ```
    cleaned_output = clean_json_string(output)

    return json.dumps(cleaned_output)


def clean_json_string(json_string):
    json_string = json_string.strip()
    # Remove ```json do início, se existir
    if json_string.startswith("```json"):
        json_string = json_string[7:].strip()

    if json_string.endswith("```"):
        json_string = json_string[:-3].strip()

    return json.loads(json_string)