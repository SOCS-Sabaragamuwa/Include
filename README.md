# LetMeHack

Request/Response Format
All requests and responses must be in JSON, with the Content-Type header set to application/json.

_Error Handling_

For API to be consistent, always return error responses in json. JSON schema of the errors returned should be like the following:
```
{
"status": 401,
"message": "Invalid username or password.",
"developerMessage": "Login attempt failed because the specified password is incorrect."
}
```
_Postman 6.7.4V_

Please use the following link to download the Postman v6.7.4  version for your platform.

https://learning.getpostman.com/docs/postman-pro/managing-pro/migrating-to-v7/#download-latest-postman-v6-app

_Github_

For each of the issues in the issue  list use a separate branch as a pull request with the issue number to be the branch name .

_Note_

- Placeholders { } in the issue document  imply actual values.

- ‘…’ implies that there could be additional properties being passed in the request.




