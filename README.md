# Remark Full-Stack Challenge: AI Tech Advisor "Barnabus"

This is a Next.js web application built for the Remark Full-Stack Challenge. It features "Barnabus," an AI-powered chatbot that acts as a witty and knowledgeable tech expert, providing users with product recommendations and advice.

## Live Demo

You can view the deployed application here: **https://remark-full-stack-challenge-seven.vercel.app/**

## Key Features

- **Conversational AI Chat**: Engage in a natural conversation with Barnabus to get tech advice.
- **Dynamic UI Generation**: The AI can generate UI components on the fly, such as product cards, comparison tables, and explanation sections, based on the user's query.
- **Real-time Streaming**: Responses from the AI are streamed in real-time for a more interactive experience.
- **Responsive Design**: The application is fully responsive and optimized for both desktop and mobile devices, with a mobile-first approach.
- **Error Handling & Loading States**: Robust loading and error states ensure a smooth user experience.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 14+ (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **AI**: [Vercel AI SDK](https://sdk.vercel.ai/) with the [OpenAI](https://openai.com/) API
- **Deployment**: [Vercel](https://vercel.com/)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18.x or later)
- [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), or [pnpm](https://pnpm.io/)

### Installation & Setup 

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/mzecic/Remark-Full-Stack-Challenge
    cd Remark-Full-Stack-Challenge
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up environment variables:**
    Create a new file named `.env.local` in the root of your project and add your OpenAI API key:

    ```
    OPENAI_API_KEY=your_openai_api_key_here
    ```

    You can get an API key from the [OpenAI Platform](https://platform.openai.com/api-keys).

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

5.  **Open the application:**
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
