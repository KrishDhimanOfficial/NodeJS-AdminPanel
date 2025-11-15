
class Fetch {
    constructor() { this.ClientAPI = window.location.origin }

    async post(endURL, data, headers) {
        const finalHeaders = { ...(headers || {}) }
        const res = await fetch(`${this.ClientAPI}${endURL}`, {
            method: 'POST',
            headers: finalHeaders,
            body: data,
            credentials: 'include'
        })
        return await res.json()
    }

    async get(endURL, headers, signal) {
        const finalHeaders = {
            'Accept': 'application/json',
            ...(headers || {})
        }
        const res = await fetch(`${this.ClientAPI}${endURL}`, {
            method: 'GET',
            headers: finalHeaders,
            signal: signal,
            credentials: 'include'
        })
        return await res.json()
    }

    async put(endURL, data, headers) {
        const finalHeaders = { ...(headers || {}) }
        const res = await fetch(`${this.ClientAPI}${endURL}`, {
            method: 'PUT',
            headers: finalHeaders,
            body: data,
            credentials: 'include'
        })
        return await res.json()
    }

    async patch(endURL, data, headers) {

        const finalHeaders = { ...(headers || {}) }
        const res = await fetch(`${this.ClientAPI}${endURL}`, {
            method: 'PATCH',
            headers: finalHeaders,
            body: headers.patch ? data : JSON.stringify(data),
            credentials: 'include'
        })
        return await res.json()
    }

    async delete(endURL, headers) {
        const finalHeaders = { ...(headers || {}) }
        const res = await fetch(`${this.ClientAPI}${endURL}`, {
            method: 'DELETE',
            headers: finalHeaders,
            credentials: 'include'
        })
        return await res.json()
    }
}

export default new Fetch