import { FormEvent, useState } from "react";

import { generateClient } from "aws-amplify/api";
import { Schema } from "../amplify/data/resource";

import { Amplify } from "aws-amplify";
import { PubSub } from '@aws-amplify/pubsub';
import outputs from "../amplify_outputs.json";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App() {
  const [prompt, setPrompt] = useState<string>("");
  const [answer, setAnswer] = useState<string | null>(null);

  const pubsub = new PubSub({
    region: 'us-east-1',
    endpoint:
      'wss://a3tw82l7ucghei-ats.iot.us-east-1.amazonaws.com/mqtt'
  });
  
  pubsub.subscribe({topics:'my-channel'}).subscribe({
    next: (data) => {
      console.log('Received message:', data.value);
      setAnswer(String(data.value));
    },
    error: (error) => {
      console.error('Error receiving message:', error);
    },
    complete: () => {
      console.log('Subscription complete');
    },
  });

  const sendPrompt = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { data, errors } = await client.queries.generateHaiku({
      prompt,
    });

    if (!errors) {
      setAnswer(data);
      setPrompt("");
    } else {
      console.log(errors);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 dark:text-white">
      <div>
        <h1 className="text-3xl font-bold text-center mb-4">Haiku Generator</h1>

        <form className="mb-4 self-center max-w-[500px]" onSubmit={sendPrompt}>
          <input
            className="text-black p-2 w-full"
            placeholder="Enter a prompt..."
            name="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </form>

        <div className="text-center">
          <pre>{answer}</pre>
        </div>
      </div>
    </main>
  );
}