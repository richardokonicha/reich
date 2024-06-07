
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
    linkedin: any
  }
  
export const config: Config = {
    dataPath: './data/user_data_dir',
    openai: process.env.OPENAI_API_KEY || "sk-proj-****************",
    linkedin: {
        home: "https://www.linkedin.com/feed",
        login: "https://www.linkedin.com/login",
        job: "https://www.linkedin.com/jobs/search/?currentJobId=3920341490&distance=25&f_AL=true&f_E=4%2C5&f_WT=2&geoId=103035651&keywords=cloud%20computing&origin=JOB_SEARCH_PAGE_JOB_FILTER",
        people: "https://www.linkedin.com/search/results/people/?geoUrn=%5B%22103644278%22%5D&network=%5B%22F%22%5D&origin=FACETED_SEARCH&sid=_vU",
        email:  process.env.LINKEDIN_EMAIL || 'email123@gmail.com',
        password: process.env.LINKEDIN_PASSWORD || 'password1234',
    }
}
