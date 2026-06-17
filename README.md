** BrowserMind**

An AI-powered autonomous browser agent web application. Give it a task in plain English, and it uses AI to complete it and return structured results.

## Features

- 7 pages: Dashboard, Task Creator, Execution Monitor, Results, History, Templates, Settings
- Real AI execution using Groq (free, no credit card needed)
- Web page reading — provide a URL and the agent reads and extracts data from it
- Task templates — save tasks you run repeatedly
- Full history — search and filter all past tasks
- Dark theme with emerald green accents

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React, TypeScript, Vite           |
| Backend   | Node.js, Express.js               |
| Database  | PostgreSQL, Drizzle ORM           |
| AI        | Groq API (Llama 3.3 70B model)    |
| Styling   | Tailwind CSS, shadcn/ui           |

## How It Works

1. User types a task instruction
2. Optionally provide a starting URL for the agent to visit
3. The server fetches the webpage content if a URL is given
4. The instruction and page content are sent to Groq AI
5. The AI returns structured results
6. Results are saved to the database and displayed to the user

## License

MIT — free to use and modify.
