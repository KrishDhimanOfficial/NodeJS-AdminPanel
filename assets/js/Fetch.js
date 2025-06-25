
class Fetch {
    constructor() { this.ClientAPI = window.location.origin }

    async post(endURL, data, headers) {
        const finalHeaders = {
            ...(headers || {})
        }
        // console.log(endURL);
        // for (let pair of data.entries()) console.table(pair[0], pair[1])
        const res = await fetch(`${this.ClientAPI}${endURL}`, {
            method: 'POST',
            headers: finalHeaders,
            body: data
        })
        return await res.json()
    }

    async get(endURL, headers, signal) {
        // console.log('Starting fetch:',endURL)
        const finalHeaders = {
            'Accept': 'application/json',
            ...(headers || {})
        }
        const res = await fetch(`${this.ClientAPI}${endURL}`, {
            method: 'GET',
            headers: finalHeaders,
            signal: signal
        })

        // signal?.addEventListener('abort', () => {
        //     console.log('Fetch aborted:',endURL)
        // })
        return await res.json()
    }

    async put(endURL, data, headers) {
        const finalHeaders = {
            ...(headers || {})
        }
        const res = await fetch(`${this.ClientAPI}${endURL}`, {
            method: 'PUT',
            headers: finalHeaders,
            body: data
        })
        return await res.json()
    }

    async patch(endURL, data, headers) {
        console.log(endURL);

        const finalHeaders = {
            ...(headers || {})
        }
        const res = await fetch(`${this.ClientAPI}${endURL}`, {
            method: 'PATCH',
            headers: finalHeaders,
            body: headers.patch ? data : JSON.stringify(data)
        })
        return await res.json()
    }

    async delete(endURL, headers) {
        const finalHeaders = {
            ...(headers || {})
        }
        const res = await fetch(`${this.ClientAPI}${endURL}`, {
            method: 'DELETE',
            headers: finalHeaders,
        })
        return await res.json()
    }
}

export default new Fetch