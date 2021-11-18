

function Validator(formSelector,options= {}) {

    function getParent(element,selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var formRules = {};
    var validatorRules = {
        required: function(value) {
            if(typeof value === 'string') {
                return value.trim() ? undefined : 'Vui lòng nhập trường này';
            }else{
                return value ? undefined : 'Vui lòng nhập trường này';
            }
        },
        email: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Trường này là email';
        },
        min: function(min) {
            return function(value) {
                return value.length >= min ? undefined : `Vui lòng nhập ít nhất ${min} kí tự`
            }
        },
        max: function(max) {
            return function(value) {
                return value.length <= max ? undefined : `Vui lòng nhập ít nhất ${max} kí tự`
            }
        }
    };


    // lay ra form element trong DOM theo 'formSelector'
    var formElement = document.querySelector(formSelector);
    // chi xu li khi co element trong dom
    if(formElement) {
        var inputs = formElement.querySelectorAll("[name][rules]")
        // console.log(inputs)
        for(var input of inputs) {
            var rules = input.getAttribute('rules').split('|');

            for(var rule of rules){
                var ruleInfo;
                var isRuleHasValue = rule.includes(':');

                if(isRuleHasValue) {
                   ruleInfo = rule.split(":");
                    rule = ruleInfo[0];
                }

                var ruleFunc = validatorRules[rule];
                if(isRuleHasValue){
                    ruleFunc = ruleFunc(ruleInfo[1]);
                }

                if(Array.isArray(formRules[input.name])){
                    formRules[input.name].push(ruleFunc);
                }else{
                    formRules[input.name] = [ruleFunc]
                }
            }

            // Lang nghe su kien de validate
            input.onblur = handleValidate ;
            input.oninput = handleClearError ;

        }
        // Ham thuc hien validate
        function handleValidate(event) {
            // console.log(event.target.value)
            var rules = formRules[event.target.name];
            var errorMessage;
            for(var rule of rules) {
                errorMessage = rule(event.target.value);
                if(errorMessage) break;
            }
            //  rules.some(function(rule) {
            //     errorMessage = rule(event.target.value);
            //     return errorMessage;
            // })
            // console.log(errorMessage)
// neu co loi thi hien thi loi
            if(errorMessage) {
                var formGroup = getParent(event.target, '.form-group');
                if(formGroup) {
                    formGroup.classList.add('invalid');
                    var formMessage = formGroup.querySelector(".form-message");
                        if(formMessage){
                            formMessage.innerText = errorMessage;
                        }
                }
            }
            return !errorMessage;
        }
// clear message
        function handleClearError(event) {
            var formGroup = getParent(event.target, '.form-group');
            if(formGroup.classList.contains('invalid')){
                formGroup.classList.remove('invalid')
                var formMessage = formGroup.querySelector(".form-message");
                    if(formMessage){
                        formMessage.innerText = '';
                    }
            }
        }
    }
    // xu li hanh vi submit
    formElement.onsubmit = function(event) {
        event.preventDefault();
        var inputs = formElement.querySelectorAll("[name][rules]");
        var isValid = true;
        for(input of inputs){
            // console.log(input)
            if(!handleValidate({target: input})){
                isValid = false;
            }  
        }
         // khi kco loi thi submit form
         if(isValid) {
            if(typeof options.Onsubmit === 'function') {
                var enableInputs = formElement.querySelectorAll('[name]:not([disabled])')

                var formValue = Array.from(enableInputs).reduce(function(value, input){
                    switch(input.type){
                        case 'radio':
                            value[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                            break;
                        case 'checkbox':
                            if(!input.matches(':checked')) {
                                value[input.value] = '';
                                return value;   
                            }
                            if(!Array.isArray(value[input.name])){
                                value[input.value] = [];
                            }
                                value[input.value].push(input.value);
                            break;
                        case 'file':
                            value[input.value] = input.files;
                            break;
                        default:
                            value[input.name] = input.value;
                    }

                    return value
                },{});
                options.Onsubmit(formValue)
            }else{
                formElement.submit();
            }
        }
    }
    console.log(formRules)
}