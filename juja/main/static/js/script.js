'use strict';

window.onload = () => {
    var userId;
    var userIsLogin = false;

    if (userIsLogin) {
        $("#login").css('display', 'none');
        $("#register").css('display', 'none');
    } else {
        $("#basket").css('display', 'none');
        $("#personalAccount").css('display', 'none');
    }

    initEventHandlers();
    
}   
function initEventHandlers() {
    //Окно авторизации

    //Кнопка "Вход"
    $("#login").click(() => {
        $('#loginWindow').parent().css('display', 'flex');
    });
    //Кнопки закрытия окна авторизации
    $("#close-auth").on("click", () => {
        $('#close-auth').parent().parent().css('display', 'none');
    });
    //Кнопка "Войти"
    $("#authBtn").on('click', () => {
        //TODO
    });
    //Кнопка "Сбросить пароль"
    $("#resetPass").on('click', () => {
        //TODO
    });
    //////////////////////////////////////////////

    //Окно регистрации

    //Кнопка "регистрация"
    $('#register').on('click', () => {
        $('#registerWindow').parent().css('display', 'flex');
    });
    //Кнопка закрытия окна регистрации
    $("#close-register").on("click", () => {
        $('#close-register').parent().parent().css('display', 'none');
    });
    //Кнопка "Продолжить"
    $("#registerBtn").on('click', () => {
        //TODO
    });
    ///////////////////////////////////////////////
}



