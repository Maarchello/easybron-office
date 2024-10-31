export const baseUrl = 'http://185.4.67.79:8080/smart';
export function getMocksByType(type, callback, errCallback) {

    fetch(`${baseUrl}/api/v1/mocks?type=${type}&sort=id,desc`)
        .then(res => {
            if (res.status >= 200 && res.status < 400) {
                let j = res.json();
                let content = j.content;
                console.log('response:')
                console.log(content);
                callback(content);
            } else if (res.status >= 400) {
                errCallback()
            }
        }).catch((err) => {
            console.log('err')
        });
}
export function deleteMock(id, callback, errCallback) {

    const requestOptions = {
        method: 'DELETE'
    };

    fetch(`${baseUrl}/api/v1/mocks/${id}`, requestOptions)
        .then((res) => {
            if (res.status >= 200 && res.status < 400) {
                callback();
            } else if (res.status >= 400) {
                errCallback()
            }
        })
        .catch((err) => {
            console.log('err')
    });
}


export function deleteProject(id, callback, errCallback) {

    const requestOptions = {
        method: 'DELETE'
    };

    fetch(`${baseUrl}/api/v1/projects/${id}`, requestOptions)
        .then((res) => {
            if (res.status >= 200 && res.status < 400) {
                callback();
            } else if (res.status >= 400) {
                errCallback()
            }
        })
        .catch((err) => {
            console.log('err')
        });
}

export function deleteProjectMethod(id, callback, errCallback) {

    const requestOptions = {
        method: 'DELETE'
    };

    fetch(`${baseUrl}/api/v1/project-methods/${id}`, requestOptions)
        .then((res) => {
            if (res.status >= 200 && res.status < 400) {
                callback();
            } else if (res.status >= 400) {
                errCallback()
            }
        })
        .catch((err) => {
            console.log('err')
        });
}

export function deleteMapping(id, callback, errCallback) {

    const requestOptions = {
        method: 'DELETE'
    };

    fetch(`${baseUrl}/api/v1/mappings/${id}`, requestOptions)
        .then((res) => {
            if (res.status >= 200 && res.status < 400) {
                callback();
            } else if (res.status >= 400) {
                errCallback()
            }
        })
        .catch((err) => {
            console.log('err')
        });
}