'use strict';

document.cookie = 'logged=false; seller=false';
var userIsLogin = getCookie('logged');
var userIsSeller = getCookie('seller');

window.onload = function() {
    
    check_role();
    checkAuth(userIsLogin);
    getMainPage()
    initEventHandlers();
    
}   
function check_role() {
    $.ajax({
        url: '/auth',
        methos: 'post',
        data: {
            csrfmiddlewaretoken: getCookie('csrftoken')
        },
        async:false,
        success: function(data) {
            console.log(data);
            setCookie('logged', data.logged);
            setCookie('seller', data.seller);
            userIsLogin = getCookie('logged');
            userIsSeller= getCookie('seller');
        }
    });
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
                                check_role();
                                checkAuth();
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
                check_role();
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

                $('#offerBtn').on('click', () => {
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
                        }
                    });
                    $('.window__close').trigger('click');
                    alert('Ваша заявка успешно отправлена! \n Ответ с решеним вы получите по электронной почте.');
                });
            }
        });
    });

    // Кпонка "Главная"
    $('#mainPage').on('click', getMainPage);

    //Кнопка "Корзина"
    $('#basket').on('click', getUserPage);

    // Кнопка "Личный кабинет"
    $('#personalAccount').on('click', getUserPage);

    // Кнопка "Мои товары"
    $('#seller_products').on('click', getSellerPage)
}


function getSellerPage() {
    $.ajax({
        url: '/seller',
        method: 'get',
        dataType: 'html',
        success: function (data) {
            $('#main_page').html(data);
            $('#addProducts_btn').on('click', addProduct);
            var userdata = getUserData();
            $('#username').text(userdata.username);
            $('#balance').text(userdata.balance);
            $('#summa').text(userdata.summary_price);
            var info = getSellerProducts();
            addProducts('#products', info.products, true);

            $('.counter').remove();
            $('.product').append('<div class="button remove_product"><img href={% static "img/close.png"%}>Удалить</div>');
            $('.remove_product').on('click', function () {
                deleteProduct($( this ).parent());
            });
            $('#addProducts_btn').on('click', getProductPreviewEditor)
        }
    });
}


function getProductPreviewEditor() {
    $.ajax({
        url: '/add_product',
        method: 'get',
        dataType: 'html',
        success: function(data) {
            $(document.body).append(data);
            $('#addProducts_btn').on('click', sendProductPreview("#fileopen"));
        }
    });
}

function getSellerProducts() {
    var info;
    $.ajax({
        url: '/seller',
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


function sendProductPreview(file_input_id) {
    var file_input = $(file_input_id);
    var opened_file = file_input.files[0];
    console.log(opened_file);

    var data = new FormData();
    data.append('image', opened_file);
    data.append('image_name', '123.png');
    data.append('csrfmiddlewaretoken', getCookie('csrftoken'));

    $.ajax({
        url: '/add_product',
        method: 'post',
        processData : false,
        contentType : false,
        data: data,
    });

    console.log(data);
};

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
            $.ajax({
                url: '/products',
                method: 'post',
                dataType: 'json',
                data: {
                    csrfmiddlewaretoken: getCookie('csrftoken')
                },
                success: function(data) {
                    addProducts('#showcase', data.products, false);
                }
            })
            
        },
        async: false
    });
}

function deleteProduct(parent) {
    var id_p = +parent.find('.id').text();
    $.ajax({
        url: '/delete_product',
        method: 'post',
        data: {
            id: id_p,
            csrfmiddlewaretoken: getCookie('csrftoken')
        },
        success: function(data) {
            getSellerPage();
        }

    });
}

function addProduct() {
    
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
            addProducts('#cart', info.products, true);
            $('#summa').text(info.summary_price);
            $('#topUpBtn').on('click', () => {
                $.ajax({
                    url: '/balance',
                    method: 'post',
                    dataType: 'json',
                    data: {
                        csrfmiddlewaretoken: getCookie('csrftoken')
                    },
                    success: function (data) {
                        
                    }
                });
            });
            $('.summa > .button').on('click', () => {
                if (info.balance < info.summary_price) {
                    alert('Недостаточно средств!\n Пополните счет')
                } else {
                    $.ajax({
                        url: '/payment',
                        method: 'post',
                        dataType: 'json',
                        data: {
                            csrfmiddlewaretoken: getCookie('csrftoken')
                        },
                        success: function(data) {
                            alert('Покупка успешно совершена');
                            location.reload();
                        }
                    });
                }
            });
        }
    });
}

// Проверка на авторизацию
function checkAuth(value) {
    value = (value == 'true') ? true : false;
    if (value) {
        $(".unlogin").css('display', 'none');
        $(".login").css('display', 'block');

        if ((userIsSeller=='true')?false:true) {
            $('#seller_products').css('display', 'none');
        } else {
            $('#offer').css('display', 'none');
        }
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

// Добавление продукта на страницу по ID селектора
function addProducts(selectorId, products, isUser) {
    for (var i = 0; i < products.length; i++) {
        var id = products[i].id;
        var content = (isUser)? '<div class="showcase__product product"><div class="id" style="display: none" id="'+id+'">'+id+'</div><div id="ctgr'+id+'"style="display: none">'+products[i].category+'</div><img class="product__img" src="/static/img/products/'+products[i].image+'" onerror="this.src=`/static/img/noimage.png`" alt=""><h3 class="product__name">'+products[i].productName+'</h3><p class="product__category"><span class="category__name">'+ products[i].category+'</span></p><p class="product__descipt">'+products[i].description+'</p><p class="product__seller"><span>Продавец: </span><span class="product__sellername">'+products[i].seller+'</span></p><div class="product__cost cost">'+products[i].cost+'</div><div class="product__counter counter"><div id="counter__left'+id+'">-</div><div id="number'+id+'" class="counter__number">'+products[i].num+'</div><div id="counter__right'+id+'">+</div><div id="close'+id+'"><img width=15 src="static/img/close.png" alt=""></div></div>' 
        : '<div class="showcase__product product"><div style="display: none" id="'+id+'">'+id+'</div><img class="product__img" src="/static/img/products/'+products[i].image+'" onerror="this.src=`/static/img/noimage.png`" alt=""><h3 class="product__name">'+products[i].productName+'</h3><p class="product__category"><span class="category__name">'+ products[i].category+'</span></p><p class="product__descipt">'+products[i].description+'</p><p class="product__seller"><span>Продавец: </span><span class="product__sellername">'+products[i].seller+'</span></p><div class="product__cost cost">'+products[i].cost+'</div><div class="product__counter counter"><div id="counter__left'+id+'">-</div><div id="number'+id+'" class="counter__number">1</div><div id="counter__right'+id+'">+</div></div><div id="btn'+id+'"class="button buy__btn">В корзину</div></div>';
        
        $(selectorId).append(content);
        minus('#counter__left'+id, '#number'+id);
        plus('#counter__right'+id, '#number'+id);
        addToCart('#btn'+id, '#'+products[i].id, '#number'+id);
        deleteFromCart('#close'+id, '#'+products[i].id);
    }
}

//Добавление в товара в корзину
function addToCart(selector, targetId, targetCount) {
    $(selector).on('click', () => {
        if ((userIsLogin == 'true')? true : false) {
            var idP = +$(targetId).text();
            var countP = +$(targetCount).text();

            $.ajax({
                url: '/add_to_cart',
                method: 'post',
                dataType: 'json',
                data: {
                    id: idP,
                    num: countP, 
                    csrfmiddlewaretoken: getCookie('csrftoken')
                }
            });
        } else {
            $('#login').trigger('click');
        }
        
    });
    
}
// Удаление из корзины
function deleteFromCart(selector, targetId) {
    $(selector).on('click', () => {
        var idP = +$(targetId).text();

        var data = {
            csrfmiddlewaretoken: getCookie('csrftoken')
        }
        data[idP] = 'delete',
        console.log(data)
        $.ajax({
            url: '/modify_cart',
            method: 'post',
            dataType: 'json',
            data: data,
            success: function(data) {
                $(targetId).parent().remove();
                var info = getUserData();
                $('#summa').text(info.summary_price);
            }
        });
    });
}

// Уменьшение кол-ва тединиц товара
function minus(selector, target) {
     $(selector).on('click', () => {
        var count = +$(target).text();
        if (count > 1) 
            count--;
        $(target).text(count);
     });  
}

// Увеличение кол-ва тединиц товара
function plus(selector, target) {
    $(selector).on('click', () => {
        var count = +$(target).text();
        if (count < 100) 
            count++;
        $(target).text(count);
    });  
}

//Запрос категорий
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
                $(selectorId).append('<li id="category'+data.categories_ids[i]+'" class="list__item">'+data.categories[i]+'</li>');
                onClickCategory('#category'+data.categories_ids[i], '#showcase', data.categories_ids[i]);
            }
        },
        async: false
    });
}

function onClickCategory(selector, target, id) {
    $(selector).on('click', () => {
        $.ajax({
            url: '/sort_category',
            method: 'post',
            dataType: 'json',
            data: {
                category_id: id,
                csrfmiddlewaretoken: getCookie('csrftoken')
            },
            success: function(data) {
                $(target + ' > *').remove();
                addProducts(target, data.products, false);
            }
        });
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