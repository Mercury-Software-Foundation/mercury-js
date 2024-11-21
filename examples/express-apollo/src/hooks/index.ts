import mercury from "@mercury-js/core";

mercury.hook.before('GET_USER_RECORD', async function(this: any) {
    // console.log("Inside get before hook", this);
})

mercury.hook.after('GET_USER_RECORD', async function(this: any) {
    // console.log("Inside get after hook", this);
    this.record.name = 'prashanth'
})

mercury.hook.before('CREATE_USER_RECORD', async function(this: any) {
    this.data.gender = 'MALE';
    console.log("Inside CREATE before hook", this);
})

mercury.hook.after('CREATE_USER_RECORD', async function(this: any) {
    this.record.gender = 'FEMALE';
    console.log("Inside CREATE after hook", this);
})

mercury.hook.before('UPDATE_USER_RECORD', async function(this: any) {
    console.log("Inside UPDATE before hook", this);
})

mercury.hook.after('UPDATE_USER_RECORD', async function(this: any) {
    this.record.mobile = '01235678'
    console.log("Inside UPDATE after hook", this);
})

mercury.hook.before('DELETE_USER_RECORD', async function(this: any) {
    console.log("Inside DELETE before hook", this);
})

mercury.hook.after('DELETE_USER_RECORD', async function(this: any) {
    console.log("Inside DELETE after hook", this);
})