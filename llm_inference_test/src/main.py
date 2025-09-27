from llama_cpp import Llama
import os
import json_repair

def generate_response(model_path, system_prompt, user_prompt):

    #loading the model
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found at {model_path}")
    try:
        llm = Llama(
            model_path=model_path,
            n_ctx=2048,       # The max sequence length to use - context window
            n_threads=8,      # The number of CPU threads to use, tailor to your system
            # n_gpu_layers=35   # The number of layers to offload to GPU, if you have GPU support
                            # Set to 0 if you don't have GPU support
        )
    except Exception as e:
        print(f"Error loading model: {e}")
        print("\nPlease ensure that you have replaced 'path/to/your/model.gguf' with the correct path to your GGUF model file.")
        exit()

    messages=[
        {'role':'system', 'content': system_prompt},
        {'role':'user', 'content': user_prompt}
    ]

    #generating response
    try:
        output=llm.create_chat_completion(
            messages=messages,
            max_tokens=512
        )

        generated_text = output['choices'][0]['message']['content'].strip()
        print(generated_text)

        json_obj=json_repair.loads(generated_text)

        from pprint import pp
        pp(json_obj)
        

    except Exception as e:
        print(f"Error during response generation: {e}")

model_path="D:\\Models\\gguf_models\\google_gemma-3n-E2B-it-Q4_K_M.gguf"
system_prompt="""
You are a meticulous fact-checking AI. Your sole purpose is to evaluate the truthfulness of the statement provided by the user. You must provide your response exclusively in a valid JSON format.

The JSON object must contain the following four keys:

    "reasoning": A concise string explaining the basis of your evaluation.

    "confidence_score": An integer between 0 (not confident) and 100 (fully confident) representing your certainty in the assessment.

    "truthy_value": A boolean value, either true or false.

    "truthy_score": An integer between 0 (completely false) and 100 (completely true) representing the degree of truthfulness of the statement.

Do not include any text or explanation outside of the final JSON object.

Example Interaction:

User: The capital of Australia is Sydney.

Your Expected Response:
{
  "reasoning": "While Sydney is Australia's largest and most populous city, the actual capital is Canberra. This is a common misconception.",
  "confidence_score": 100,
  "truthy_value": false,
  "truthy_score": 0
}
"""
user_prompt="The sun rises in the west."
generate_response(model_path,system_prompt,user_prompt)
