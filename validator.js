
// Hàm validator
function Validator(options) {
    function getParent(element,selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }


    var selectorRule = {};
    // Ham thuc hien validate
    function validate(inputElement, rule) {
        var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector);
        var errorMessage;

        // Lấy ra các rules của selector
        var rules = selectorRule[rule.selector];
        // Lặp qua từng rules và ktra
        for(var i=0; i<rules.length; i++) {
            switch(inputElement.type) {
                case 'checkbox':
                case 'radio':
                    errorMessage =  rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    )
                    break;
                default:
                    errorMessage =  rules[i](inputElement.value)
            }
          if(errorMessage) break;
        }

            if(errorMessage) {
                errorElement.innerText =errorMessage;
                getParent(inputElement,options.formGroupSelector).classList.add('invalid')
            }else{
                errorElement.innerText = '';
                getParent(inputElement,options.formGroupSelector).classList.remove('invalid')
         }
         return !errorMessage;
    }
    // console.log(options)
    // lay element cua form
    var formElement = document.querySelector(options.form);

    if(formElement) {
        formElement.onsubmit = function(e) {
            e.preventDefault();

            var isFormValid = true;

            options.rules.forEach(function(rule){
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement,rule);
                if(!isValid) {
                    isFormValid = false;
                }
            })

            
            // console.log(formValue)
            if(isFormValid) {
                // console.log('khong co loi');
                if(typeof options.onSubmit === 'function') {

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
                    options.onSubmit({
                        formValue
                    })
                }else{
                    formElement.submit();
                }
            }
        }
        // Xu li lap qua moi rule và xử lí
        options.rules.forEach(function(rule){

            // luu lai cac rule cho moi input
                // selectorRule[rule.selector] = rule.test;
            if(Array.isArray(selectorRule[rule.selector])){
                selectorRule[rule.selector].push(rule.test);
            }else{
                selectorRule[rule.selector] = [rule.test];
            }

            var inputElements = formElement.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach(function(inputElement) {
                 // xu li truong hop blur khoi input
                 inputElement.onblur = function() {
                    // alert('as')
                    validate(inputElement,rule);
                }
                // xu li moi khi nguoi dung nhap
                inputElement.oninput = function() {
                     var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector);
                     errorElement.innerText = '';
                     getParent(inputElement,options.formGroupSelector).classList.remove('invalid')
                }
            })
        })
        // console.log(selectorRule)
    }
}


// Định nghĩa rules
// Nguyên tắc: 
/**
 * 1. Khi có lỗi trả ra mess lỗi
 * 2.Khi hợp lệ không trả ra gì
 */
Validator.isRequired = function(selector,message) {
    return {
        selector : selector,
        test: function (value) {
            if(typeof value === 'string'){
                 return value.trim() ? undefined  : message || 'Vui lòng nhập trường này';
            }else{
                return value ? undefined :message || 'Vui lòng nhập vào trường này';
            }
        }
    };
}

Validator.isEmail = function(selector,message) {
    return {
        selector : selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Trường này phải là email'
        }
    };
}

Validator.minLength = function(selector,min,message) {
    return {
        selector : selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiếu ${min} kí tự`
        }
    };
}

Validator.isComfirmed = function(selector,getComfirmValue,message) {
    return {
        selector: selector,
        test: function(value){
            return value ===getComfirmValue() ? undefined : message || 'Gía trị nhập vào không chính xác'
        }
    }
}