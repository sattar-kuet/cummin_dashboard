/** @odoo-module */
export class Utility {
    setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        const cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
        document.cookie = cookie;
    }
    getCookie(name) {
        const cookieName = `${name}=`;
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.indexOf(cookieName) === 0) {
                return cookie.substring(cookieName.length, cookie.length);
            }
        }
        return null;
    }
    getBaseUrl() {
        var baseUrl = window.location.protocol + "//" + window.location.host
        return baseUrl
    }

}