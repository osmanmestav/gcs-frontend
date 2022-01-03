import { UserCredentials } from "../models/userModels/userCredentials";

export const getUserCredentials : () => UserCredentials | null = () => {
    
    let userName = 'unknown';
    for(let i = 0; i<localStorage.length; i++){
        const ithKey = localStorage.key(i);
        if(ithKey != null && ithKey.endsWith('LastAuthUser')){
            userName = localStorage.getItem(ithKey)!;
            break;
        }
    }
    if(userName === 'unknown')
        return null;
    let userData: any;
    for(let i = 0; i<localStorage.length; i++){
        const ithKey = localStorage.key(i);
        if(ithKey != null && ithKey.endsWith(userName+'.userData')){
            userData = JSON.parse(localStorage.getItem(ithKey)!);
            break;
        }
    }

    let tenantCode : string = userData.UserAttributes.find((x: { Name: string; Value: string }) => x.Name === 'custom:organization')?.Value ?? 'unknown';
    let isPilot : boolean = userData.UserAttributes.find((x: { Name: string; Value: string }) => x.Name === 'custom:Role')?.Value === 'Pilot' ?? 'false';
    
    if(tenantCode === 'unknown')
        return null;

    return new UserCredentials(tenantCode, userName, isPilot);
}