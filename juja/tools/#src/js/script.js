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
    getMainPage()
    initEventHandlers();
    
}   
function initEventHandlers() {
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
                                $('.window__close').trigger('click');
                                getUserPage(data);
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
    
    //Кнопка "Регистрация"
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
                                userIsLogin = getCookie('logged');
                                $('.window__close').trigger('click');
                                getUserPage();
                            } else {
                                $('#message').text(data.message).css('display', 'block');
                            }
                        }
                    });
                });
            }
        });
    });
   
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

    // Кнопка "Стать продавцом"
    $('#offer').on('click', () => {
        $.ajax({
            url: '/offer',
            method: 'get',
            dataType: 'html',
            success: function(data) {
                $(document.body).append(data);

                 //Кнопка закрытия окна 
                $(".window__close").on("click", () => {
                    $('.window__close').parent().parent().remove();
                });

                $('.form__btn').on('click', () => {
                    $.ajax({
                        url: '/offer',
                        method: 'post',
                        dataType: 'json',
                        data: {
                            firstName: $('#userFirstName').val(),
                            lastName: $('#userLastName').val(),
                            email: $('#userEmail').val(),
                            message: $('#userOffer').val(),
                            csrfmiddlewaretoken: getCookie('csrftoken')
                        },
                        success: function(data) {
                            $('.window__close').trigger('click');
                        }
                    });
                });
            }
        });
    });

    // Кпонка "Главная"
    $('#mainPage').on('click', () => {
        getMainPage();
    });

    //Кнопка "Корзина"
    $('#basket').on('click', () => {
        getUserPage();
    });

    // Кнопка "Личный кабинет"
    $('#personalAccount').on('click', () => {
        getUserPage();
    });
}

// Загрузка контента главной страницы
function getMainPage() {
    $.ajax({
        url: '',
        method: 'post',
        dataType: 'html',
        data: {
            csrfmiddlewaretoken: getCookie('csrftoken')
        },
        success: function(data) {
            $('#main_page').html(data);
            getCategories('#category__list');
        }
    });
}

// Загрузка контента страницы пользователя
function getUserPage() {
    $.ajax({
        url: '/user',
        method: 'get',
        dataType: 'html',
        success: function(data) {
            $('.main').html(data);
            setCookie('logged', true);
            userIsLogin = getCookie('logged');
            checkAuth(userIsLogin);
            var info = getUserData();
            $('#username').text(info.username);
            $('#balance').text(info.balance);
            addProducts('#cart', info.products);
        }
    });
}

// Проверка на авторизацию
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
// Получение данных о пользователе:
 function getUserData() {
     var info;
     $.ajax({
        url: '/user',
        method: 'post',
        dataType: 'json',
        data: {
            csrfmiddlewaretoken: getCookie('csrftoken')
        },
        success: function(data) {
            info = data;
        },
        async: false
     });
     return info; 
 }

 function addProducts(selectorId, products) {
     console.log(products);
    for (var i = 0; i < products.length; i++) {
        $(selectorId).append('<div class="showcase__product product"><img class="product__img" src="/static/img/products/'+products[i].image+'" alt=""><h3 class="product__name">'+products[i].productName+'</h3><p class="product__category"><span>категория:</span> <span class="category__name">'+ products[i].category+'</span></p><p class="product__descipt">'+products[i].description+'</p><div class="product__cost cost">'+products[i].cost+'</div><div class="button buy__btn">В корзину</div></div>');
    }
 }

function getCategories(selectorId) {
    $.ajax({
        url: '/categories',
        method: 'post',
        dataType: 'json',
        data: {
            csrfmiddlewaretoken: getCookie('csrftoken') 
        },
        success: function(data) {
            for (var i = 0; i < data.categories.length; i++) {
                $(selectorId).append('<li class="list__item">'+data.categories[i]+'</li>');
            }
        },
        async: false
    });
}

// Вспомогательные функции для работы с Cookies
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