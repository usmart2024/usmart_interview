import openai
import os
from langchain.llms import OpenAI
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv, find_dotenv
from langchain.output_parsers import CommaSeparatedListOutputParser, ResponseSchema, StructuredOutputParser
load_dotenv(find_dotenv())
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


def evaluate_question(query, expected_answer, provided_answer ):

    response_schemas = [
        ResponseSchema(name="question", description="question for the candidate"),
        ResponseSchema(name="expected_answer", description="Candidate`s expected answer"),
        ResponseSchema(name="provided_answer", description="Candidate`s provided answer"),
        ResponseSchema(name="feedback", description="Feedback for the provided_answer against expected_answer"),
        ResponseSchema(name="grade", description="Evalute provided_answer against expected_answer with score from 0 to 10")
    ]

    output_parser = StructuredOutputParser.from_response_schemas(response_schemas)
    print(output_parser)

    format_instructions = output_parser.get_format_instructions()
    print(format_instructions)

    prompt = PromptTemplate(
        template=" You are a tech lead knowledgeable in various technologies. Your role is to analyze "
                 " the provided_answer against expected_answer "
                 " expected_answer: Java is an object-oriented language, provided_answer: Java is a markup language. "
                 " Compare the provided_answer and expected_answer and respond in the JSON format "
                 " Respond in the format \n{format_instructions}. Now here you go the question {query} , expected_answer {expected_answer},"
                 " and provided_answer {provided_answer} ",
        input_variables=["query", "expected_answer", "provided_answer"],
        partial_variables={"format_instructions": format_instructions}
    )


    prompt = prompt.format(query = query, expected_answer= expected_answer, provided_answer = provided_answer )
    output = llm(prompt)
    print(output)


# evaluate_question("Immutability – how to create immutable custom class with list",
#                   "An object is immutable when its state doesn’t change after it has been initialized. For example, String is an immutable class and, once instantiated, the value of a String object never changes.",
#                   "String is an immutable class and, once instantiated, the value of a String object never changes")