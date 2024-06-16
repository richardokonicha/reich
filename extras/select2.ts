import { sanitizeHtml } from './utils';


(async () => {

    try {
        const processedHtml = sanitizeHtml('<div><script>alert("hello")</script></div>');
        console.log(processedHtml);
    } catch (error) {
        
    }

})();