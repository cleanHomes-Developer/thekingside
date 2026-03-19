"""
Meezan Legal AI - Backend Proxy Server
Proxies chat requests to OpenAI with a specialized Arabic legal system prompt.
"""
import os
import json
from flask import Flask, request, jsonify
from openai import OpenAI

app = Flask(__name__)
client = OpenAI()  # Uses OPENAI_API_KEY + base_url from environment

# CORS headers for local dev
@app.after_request
def add_cors(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
    return response

@app.route('/api/chat', methods=['OPTIONS'])
def chat_options():
    return '', 204

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    messages = data.get('messages', [])
    jurisdiction = data.get('jurisdiction', 'الأردن')

    system_prompt = f"""أنت ميزان، مساعد قانوني ذكي متخصص في القانون العربي. تعمل وفق قوانين {jurisdiction}.

قواعد الإجابة:
- أجب دائماً باللغة العربية الفصحى
- اذكر المواد القانونية والأرقام بدقة (مثل: المادة ٥٦٢ من القانون المدني الأردني)
- كن موجزاً ومنظماً: استخدم نقاط أو أرقام عند الحاجة
- في نهاية كل إجابة، اذكر ٢-٣ مصادر قانونية ذات صلة بين قوسين مربعين بالشكل: [المصدر: ...]
- إذا لم تكن متأكداً من معلومة، صرّح بذلك بدلاً من الاختراع
- لا تقدم استشارة قانونية ملزمة؛ وضّح أن إجاباتك للإرشاد فقط
- القضايا المدنية والتجارية والعمالية والعقارية هي تخصصك الأساسي

الولاية القضائية الحالية: {jurisdiction}"""

    completion = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "system", "content": system_prompt}] + messages,
        stream=False,
        max_tokens=800,
        temperature=0.3,
    )
    answer = completion.choices[0].message.content
    return jsonify({'content': answer})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050, debug=False)
