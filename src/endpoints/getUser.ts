import * as utils from '../tools/utils/utils'

function initiate (router: any, name: string) {
    router.get(`/${name}`, func)
}

function func (request: any, response: any) {
    if (!request.query.identity) return response.status(200).send({err: `Parameter 'identity' is required`}); if (!request.query.value) return response.status(200).send({err: `Parameter 'value' is required`});
    
    utils.user.get(request.query.identity, request.query.value)
        .then(users => {
            response.status(200).send(users);
        })
        .catch(err => {
            response.status(200).send({err});
        })
}

export {initiate}