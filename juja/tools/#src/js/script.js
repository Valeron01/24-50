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
    $("#login").on('click', () => {
        $.ajax({
            url: '/login',
            method: 'get',
            dataType: 'html',
            success: function(data) {
                $(document.body).append(data);
                //Кнопка "Войти"
                $("#authBtn").on('click', () => {
                    $.ajax({
                        url: '/login',
                        method: 'post',
                        data: {
                            login: $('authLogin').text(),
                            password: $('authPass').text(),
                            csrfmiddlewaretoken: csrf_token
                        },
                        dataType: 'html',
                        success: function(data) {
                           alert("Хуяк! Вертушка!");
                        }
                    });
                });

                //Кнопка "Сбросить пароль"
                $("#resetPass").on('click', () => {
                    //TODO
                });
                
                //Кнопка "Закрыть"
                $("#close-auth").on("click", () => {
                    $('#close-auth').parent().parent().remove();
                });
            }
        });
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



