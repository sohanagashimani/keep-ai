# Google Keep Clone
This project is a clone of Google Keep, a note-taking application developed by Google. The aim of this project is to replicate the core features and functionalities of Google Keep, allowing users manage their notes.

![image](https://github.com/sohanagashimani/google-keep-clone/assets/73119181/758db438-9e5f-4e99-b35f-e19f67146fb5)


## Features

- Create Notes: Users can create new notes with titles and content, just like in Google Keep.
- Edit & Delete: Users can edit the content and title of existing notes or delete them as needed.
- Task Management: Users can mark notes as completed
- Search Functionality: Users can search for specific notes using keywords or filters to quickly find the desired information.
- Responsive Design: The application is fully responsive and optimized for both desktop and mobile devices
- Security: Row Level Security (RLS) enabled for data protection
- Performance: Infinite scroll implementation for better user experience

## AI Assistant

The application features a powerful AI assistant powered by Google's Vertex AI (Gemini 2.0) that can help you manage your notes through natural language commands.

### Key Features

- **Natural Language Processing**: Interact with your notes using everyday language
- **Real-time Chat Interface**: Instant responses with loading states
- **Contextual Understanding**: The AI understands your notes' content and context
- **Protected Routes**: Secure chat functionality with authentication middleware
- **Usage Limits**: Daily message and token limits to ensure fair usage


### AI Capabilities

The AI assistant can perform the following actions:

1. **Note Management**
   - Create new notes
   - Update existing notes
   - Delete notes
   - Mark notes as complete/incomplete
   - Restore deleted notes
   - Delete all notes (with confirmation)

2. **Search & Query**
   - Search notes by content or title
   - Count notes with specific titles
   - Ask questions about specific notes
   - Find and list matching notes

3. **Smart Interactions**
   - Handle multiple matches with interactive selection
   - Provide contextual responses
   - Maintain conversation history
   - Understand natural language commands

### Example Commands

Here are some examples of how to interact with the AI assistant:

```plaintext
# Creating Notes
"Create a new note titled 'Meeting Notes' with the content 'Discuss project timeline'"
"Add a note about my shopping list"

# Updating Notes
"Update the meeting notes to include the new deadline"
"Change the title of my shopping list to 'Grocery List'"

# Managing Tasks
"Mark the meeting notes as complete"
"Uncomplete my shopping list"

# Searching & Querying
"Find all notes about meetings"
"How many notes do I have about shopping?"
"What's in my meeting notes from last week?"

# Deleting & Restoring
"Delete the shopping list"
"Restore my deleted meeting notes"
"Delete all notes" (requires confirmation)

# Note Queries
"What does the note titled 'meeting notes' say about next steps?"
"Summarize the note called 'project plan'"
"What deadline is mentioned in the note 'launch'?"
```

Note: The AI processes one action at a time. For complex operations that require multiple steps (like finding and then modifying multiple notes), you'll need to perform each step separately.

### Usage Limits

- Daily message limit: 50 messages
- Daily token limit: 10,000 tokens


## Tech Stack

- Next.js 14
- TailwindCSS
- Supabase
- Google Vertex AI (Gemini 2.0)

## Run Locally

Clone the project

```bash
git clone https://github.com/sohanagashimani/google-keep-clone.git
```

Go to the project directory

```bash
  cd google-keep-clone
```

Install dependencies

```bash
  npm install
```

Set up environment variables:
Create a `.env.local` file in the root directory and add:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
GOOGLE_APPLICATION_CREDENTIALS=your_base64_encoded_credentials
PROJECT_ID=your_google_cloud_project_id
```

Start the server

```bash
  npm run dev
```

## Authentication

The application uses Supabase for authentication. Protected routes (like the chat feature) are secured using middleware to ensure only authenticated users can access them.

## Mobile Support

The application provides a seamless experience across all devices:
- Desktop: Chat interface available in a drawer component
- Mobile: Dedicated chat page with optimized layout
- Responsive design adapts to different screen sizes

