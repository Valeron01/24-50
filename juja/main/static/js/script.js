'use strict';

document.cookie = 'logged=false';
var userIsLogin = getCookie('logged');

window.onload = () => {
    $.ajax({
        url: '/auth',
        methos: 'post',
        data: {
            csrfmiddlewaretoken: getCookie('csrftoken')
        },
        async:false,
        success: function(data) {
            setCookie('logged', data.logged);
            userIsLogin = getCookie('logged');
        }
    });
    
    checkAuth(userIsLogin);
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
                        
                        success: function(data) {
                            if (data.is_logged) {
                               $.ajax({
                                url: '/user',
                                method: 'get',
                                dataType: 'html',
                                success: function(data) {
                                    $('.window__close').trigger('click');
                                    $('#main_page').html(data);
                                    setCookie('logged', true);
                                    userIsLogin = getCookie('logged');
                                    checkAuth(userIsLogin);
                                }
                               });
                            } else {
                                $('.message').text("Неверный логин или пароль").css('display', 'block');
                            }
                        }
                    });
                });

                //Кнопка "Сбросить пароль"
                $("#resetPass").on('click', () => {
                    //TODO
                });
                
                //Кнопка "Закрыть"
                $(".window__close").on("click", () => {
                    $('.window__close').parent().parent().remove();
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
                $(".window__close").on("click", () => {
                    $('.window__close').parent().parent().remove();
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
                                setCookie('logged', data.is_logged);
                                userIsLogin = Boolean(getCookie('logged'));
                                $.ajax({
                                    url: '/user',
                                    method: 'get',
                                    dataType: 'html',
                                    success: function(data) {
                                        $.ajax({
                                            url: '/user',
                                            method: 'get',
                                            dataType: 'html',
                                            success: function(data) {
                                                $('.window__close').trigger('click');
                                                $('.main').html(data);
                                                checkAuth(userIsLogin);
                                            }
                                        })
                                        
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
    // Кнопка выхода из аккаунта
    $('#exit').on('click', () => {
        $.ajax({
            url: '/exit',
            method: 'post',
            data: {
                csrfmiddlewaretoken: getCookie('csrftoken')
            },
            success: function(data) {
                setCookie('logged', false);
                userIsLogin = getCookie('logged');
                window.location.href = "/";
                checkAuth(userIsLogin);
            }
        });
    });
}

function checkAuth(value) {
    value = (value == 'true') ? true : false;
    if (value) {
        $(".unlogin").css('display', 'none');
        $(".login").css('display', 'block');
    } else {
        $(".unlogin").css('display', 'block');
        $(".login").css('display', 'none');
    }
}


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

function setCookie(name, value, options = {}) {

    options = {
      path: '/',
      // при необходимости добавьте другие значения по умолчанию
      ...options
    };
  
    if (options.expires instanceof Date) {
      options.expires = options.expires.toUTCString();
    }
  
    let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
  
    for (let optionKey in options) {
      updatedCookie += "; " + optionKey;
      let optionValue = options[optionKey];
      if (optionValue !== true) {
        updatedCookie += "=" + optionValue;
      }
    }
  
    document.cookie = updatedCookie;
  }