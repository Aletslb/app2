var app = angular.module('mercantil', ['ui.router', 'ui-notification', 'ngStorage']);

app.config(function (NotificationProvider) {
    NotificationProvider.setOptions({
        delay: 10000,
        startTop: 20,
        startRight: 10,
        verticalSpacing: 20,
        horizontalSpacing: 20,
        positionX: 'center',
        positionY: 'bottom'
    });
});

app.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('login');

    $stateProvider.state('dashboard', {
        name: 'dashboard',
        url: '/dashboard',
        templateUrl: 'views/dashboard.html'
    });

    $stateProvider.state('login', {
        name: 'login',
        url: '/login',
        templateUrl: 'views/login.html'
    });

    $stateProvider.state('carrito', {
        name: 'carrito',
        url: '/carrito',
        templateUrl: 'views/carrito.html'
    });

    $stateProvider.state('pedido', {
        name: 'pedido',
        url: '/pedido',
        templateUrl: 'views/pedido.html'
    });

    $stateProvider.state('cuenta', {
        name: 'cuenta',
        url: '/cuenta',
        templateUrl: 'views/cuenta.html'
    });
});

app.controller('loginController', function ($log, $state, Notification, $localStorage) {

    var vm = this;
    vm.data = {};
    $localStorage.user = {};
    vm.enviar = function (data) {

        $log.info(data);

        //validar usuario y contrasena
        if (data.usuario === "Alex" && data.password === "123" || data.usuario === "lalo" && data.password === "123") {

            $localStorage.user.name = data.usuario;
            $localStorage.user.email = "alejandro_95_5@hotmail.com";
            //si el usuario y contraseña es correcto ir al state de inicio
            return $state.go('dashboard');
        }

        //si no mostrar toast de usuario y/o contrasena incorrecto
        Notification.error('<i class="fa fa-times"><i/> Error usuario y contrasena incorrectos');

    };          

});

app.controller('dashboardController', function ($log, Notification, $localStorage) {

    var vm = this;

    vm.carritototal = 0;

    vm.usuario = $localStorage.user.name;

    vm.carro = [];

    vm.items = [
        {
            id: 1,
            name: "Coca Cola",
            precio: "200.00",
            descripcion: "Coca Cola 500 ml"
        },
        {
            id: 2,
            name: "Modelo Light",
            precio: "60.00",
            descripcion: "Six Modelo Light"
        },
        {
            id: 3,
            name: "Doritos",
            precio: "15.00",
            descripcion: "SB1"
        },
        {
            id: 4,
            name: "Bud Light",
            precio: "18.00",
            descripcion: "BD355"
        },
        {
            id: 5,
            name: "Corona Extra",
            precio: "15.00",
            descripcion: "CE355"
        }
    ]

    vm.agregarCarrito = function (data) {

        $log.info('qonda');

        // indetificar si el name ya existe entonces solo sumar uno a la cantidad

        //Validar si esta dentro del arreglo

        if (vm.carro.length) { //Ya hay articulos en el carro

            var found = false;

            vm.carro.filter(function (item) {
                if (item.name === data.name) {
                    found = true;
                    item.cantidad = item.cantidad + 1;
                    item.subtotal = item.cantidad * parseFloat(item.precio);
                }
                return item;
            });
            if (found) {
                return Notification.success('Carrito actualizado <h5>' + data.name + " " + data.cantidad + '</h5>');;
            }
        }

        data.cantidad = 1;
        data.subtotal = data.cantidad * parseFloat(data.precio);
        vm.carro.push(data);

        // enviar el arreglo a ngstorage
        $localStorage.carrito = vm.carro;

        vm.carritototal = $localStorage.carrito.length;

        Notification.success('Agregado al carrito <h4>' + data.name + '</h4>');

    };



});

app.controller("carritoController", function ($localStorage, $state, $http) {

    var vm = this;

    vm.carrito = $localStorage.carrito;
    vm.usuario = $localStorage.user.name;
    vm.post = {};

    total()

    vm.borrar = function (item) {
        vm.carrito.splice(item, 1);

        total()
    }

    vm.actualizarcantidad = function (item) {
        item.subtotal = item.precio * item.cantidad;

        total()
    }

    function total() {
        vm.total = vm.carrito.reduce(function (all, item) {
            return all + item.subtotal;
        }, 0);
    }

    vm.enviar = function () {

        console.log(vm.post, vm.carrito);
        $localStorage.pedido = [{
            cliente: {
                name: $localStorage.user.name,
                direccion: vm.post.direccion,
                numero: vm.post.numero,
                notas: vm.post.comentario
            },
            pedido: vm.carrito,
            total: vm.total
        }];

        $http.post('http://mercantildelarosa.herokuapp.com//mailer/send', {
            cliente: {
                name: $localStorage.user.name,
                direccion: vm.post.direccion,
                numero: vm.post.numero,
                notas: vm.post.comentario,
                email: "alejandro_95_5@hotmail.com"
            },
            pedido: vm.carrito,
            total: vm.total
        })
            .then(function(data){
                console.log(data);
        }).catch(function(error){
                console.log(error);
        });

        $state.go("pedido");
    }

});

app.controller("pedidoController", function ($localStorage) {

    var vm = this;

    vm.data = $localStorage.pedido;

});
