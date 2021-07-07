'use strict';

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


var userId = 1;
var userIsLogin = false;


window.onload = () => {
    checkAuth();
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
                            login: $('#authLogin').val(),
                            password: $('#authPass').val(),
                            csrfmiddlewaretoken: getCookie('csrftoken')
                        },
                        dataType: 'html',
                        success: function(data) {
                           if (data.is_logged) {
                                //TODO
                           } else {
                                $('#message').text("Неверный логин или пароль").css('display', 'block');
                           }
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
        $.ajax({
            url: '/register',
            method: 'get',
            dataType: 'html',
            success: function(data) {
                $(document.body).append(data);

                 //Кнопка закрытия окна регистрации
                $("#close-register").on("click", () => {
                    $('#close-register').parent().parent().remove();
                });

                //Кнопка "Продолжить"
                $("#registerBtn").on('click', () => {
                    if ($('#userPass').val() != $('#userPassConfirm').val()) {
                        $('#message').text("пароли не совпадают").css('display', 'block');
                        return;
                    }
                    $.ajax({
                        url: '/register',
                        method: 'post',
                        dataType: 'json',
                        data: {
                            login: $('#userName').val(),
                            email: $('#userLogin').val(),
                            password: $('#userPass').val(),
                            csrfmiddlewaretoken: getCookie('csrftoken')
                        },
                        success: function(data) {
                            if (data.is_reg) {
                                $.ajax({
                                    url: '/user',
                                    method: 'get',
                                    dataType: 'html',
                                    data: {
                                        user_id: userId,
                                    },
                                    success: function(data) {
                                        userIsLogin = true;
                                        checkAuth();
                                    }
                                });
                                console.log(data.user);
                            } else {
                                $('#message').text(data.message).css('display', 'block');
                            }
                        }
                    });
                });
            }
        });
    });
   
    ///////////////////////////////////////////////
}

function checkAuth() {
    if (userIsLogin) {
        $("#login").css('display', 'none');
        $("#register").css('display', 'none');
    } else {
        $("#basket").css('display', 'none');
        $("#personalAccount").css('display', 'none');
    }
}



