export interface Config {
    dataPath: string
    openai: string,
    freelancer: any
};

export const config: Config = {
    dataPath: './data/user_data_dir',
    openai: process.env.OPENAI_API_KEY || "sk-proj-****************",
    freelancer: {
        home:   "https://www.freelancer.com",
        login:  "https://www.freelancer.com/login",
        job:    "https://www.freelancer.com/search/projects",
        email:  process.env.LINKEDIN_EMAIL || '***********@gmail.com',
        password: process.env.LINKEDIN_PASSWORD || '$*********',
    }
};

export const browserArgs = [
    // '--disable-web-security',
    // '--disable-features=IsolateOrigins,site-per-process',
    // '--disable-blink-features=AutomationControlled',
    // '--no-sandbox',
    // '--disable-setuid-sandbox',
    // '--disable-dev-shm-usage',
    // '--disable-webgl',
    // '--disable-rtc-smoothness-algorithm',
    // '--disable-webrtc-encryption',
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