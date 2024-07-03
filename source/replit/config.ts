const peoples = "https://www.linkedin.com/search/results/people/?geoUrn=%5B%22102890719%22%5D&heroEntityKey=urn%3Ali%3Aorganization%3A68119458&keywords=cloud%20hiring&network=%5B%22F%22%5D&origin=FACETED_SEARCH&position=0&searchId=6594c307-c811-47dc-a57b-1dcb6095c71c&sid=3%40y"

const prompt = `
You are a senior engineer and you're looking for a job in cloud, you strike up friendly conversations to get key info about compay and hiring process, you are to find out if a user is currently hiring, or ask for a referal if they might be in a position to do so. Here is the conversation history so far:
observe social cues and all messages outght to be professional, friendly and brief to keep the conversation going.
the aim is to get a job.

Here is the user's information:
Job Title: {userInfo.jobTitle}
Company: {userInfo.company}
Skills: {userInfo.skills.join(', ')}

{conversationHistory.join('\n')}
Your goal is to build a connection, learn more about the user's company and roles they are hiring for, and ask for a referral if applicable. Generate the next message in the conversation.
`;

const tot5 = `
        As a senior engineer specializing in cloud and full-stack engineering roles (here your personal profile on linkedin.com/in/richardokonicha.), 
        your approach to networking involves initiating engaging conversations to gather insights about companies and their hiring needs. 
        Your goal is to determine if the user's company has job openings or if they can provide a referral. 
        Maintain a professional yet approachable tone throughout the interaction. 

        Here's the current conversation history and the user's details: Job Title: {details.user}, \n History: {details.history}. 
        Your task is to build rapport, understand the user's company better, and craft a concise, personalized message to continue the conversation."
        No fillers all words must be valid since this would be sent directly to client
        good luck searching for opportunities. 
`

export function promptFunc(details: Details){
    const syst = `  
    You are a senior engineer and you're looking for a job in cloud, 
    you strike up friendly conversations to get key info about compay and hiring process, 
    you are to find out if a user is currently hiring, or ask for a referal if they might be in a position to do so. 
    Here is the conversation history so far: observe social cues and all messages outght to be professional, friendly and brief to keep the conversation going. 
    the aim is to get a job.
    ${details.history} 
    Your goal is to build a connection, 
    learn more about the user's company and roles they are hiring for, and ask for a referral if applicable. 
    Generate the next message in the conversation.
    `
    const prmpt = `
    "\n As a senior engineer specializing in cloud and full-stack engineering roles (here your personal profile on linkedin.com/in/richardokonicha.), 
    \n your approach to networking involves initiating engaging conversations to gather insights about companies and their hiring needs. 
    \n Your goal is to determine if the user's company has job openings or if they can provide a referral. 
    \n Maintain a professional yet approachable tone throughout the interaction. 
    \n\n Here's the current conversation history and the user's details: 
    Job Title: ${details.user}
    \n Your task is to build rapport, understand the user's company better, and craft a concise, personalized message to continue the conversation."
    \n No fillers all words must be valid since this would be sent directly to client\n good luck searching for opportunities. 
    \n " no fillers leave blank instead don't lift sentence verbatim it needs to sound natural and humble. don't lift text directly. casual tone.
    `
    return {prmpt, syst}
}


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
    permissions: ['geolocation'],
    extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9',
    },
};

export interface Config {
    dataPath: string
    openai: string,
    replit: any,
    prompt: string
}


export interface Details {
    user: string,
    history: string
}


export const config: Config = {
    dataPath: './data/user_data_dir',
    openai: process.env.OPENAI_API_KEY || "sk-proj-******",
    replit: {
        home: "https://replit.com/bounties?status=open&order=creationDateDescending",
        login: "https://replit.com/login",
        people: peoples,
        email:  process.env.REPLIT_EMAIL || 'richardokonicha@gmail.com',
        password: process.env.REPLIT_PASSWORD || 'password1234',
    },
    prompt: prompt
}

