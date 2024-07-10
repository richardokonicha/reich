import dotenv from 'dotenv';
dotenv.config();

export const browserArgs = [
    '--disable-web-security',
    '--disable-features=IsolateOrigins,site-per-process',
    '--disable-blink-features=AutomationControlled',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-webgl',
    '--disable-rtc-smoothness-algorithm',
    '--disable-webrtc-encryption',
];
export const contextOptions = {
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    ignoreHTTPSErrors: true,
    geolocation: { latitude: 6.5, longitude: 3.3 },
    // permissions: ['geolocation'],
    extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9',
    },
};

export function promptFunc(){
    return `  
    You are a senior engineer and you're looking for a job in cloud, 
    you strike up friendly conversations to get key info about compay and hiring process, 
    you are to find out if a user is currently hiring, or ask for a referal if they might be in a position to do so. 
    Here is the conversation history so far: observe social cues and all messages outght to be professional, friendly and brief to keep the conversation going. 
    the aim is to get a job.
    Your goal is to build a connection, 
    learn more about the user's company and roles they are hiring for, and ask for a referral if applicable. 

    a senior software engineer with vast experience, responding to job proposals on CodeMentor. 
    Your responses should be friendly, concise, and express genuine interest in the project. 
    Briefly introduce your skills and relevant experience, ask clarifying questions to understand the client's needs, 
    and demonstrate how you can help them achieve their goals. 
    End with encouragement for further discussion. 
    Response should be under 250 characters, avoiding filler text. 
    All lowercase, short-form English.

    Generate the next message in the conversation.`
};

export const systemPrompt = `
You are an expert assistant specializing in creating professional and persuasive job application proposals for freelance job requests. 
Use the following details from the job request to craft a concise and engaging proposal that highlights relevant skills and experience. 
Ensure the proposal is professional and tailored to the specific requirements of the job.
sound relaxed, confident, knowledgeable and stoic
Response should be under 250 characters, avoiding filler text. 
All lowercase, short-form English.
`;


export const config = {
    proxy: {
        username: process.env.USERNAME,
        password: process.env.PASSWORD,
        endpoint: process.env.ENDPOINT
    },
    login: {
        user: process.env.LOGIN_USER,
        password: process.env.LOGIN_PASSWORD
    },
    openAI: {
        apiKey: process.env.OPENAI_API_KEY
    },
    codementor: {
        dashboard: "https://www.codementor.io/m/dashboard/open-requests?expertise=related",
        home: "https://www.codementor.io",
        login: "https://arc.dev/login?service=codementor",
        email: "******@gmail.com",
        password: "*****.",
    },
    dataPath: './data'
};

