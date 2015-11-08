(function () {
    'use strict';

    angular
        .module('keno', ['ui.bootstrap'])
        .constant('config', {
            servidor: '/servidor.php',
            operaciones: {
                'obtener-perfil': 'obtener-perfil',
                'registrar-perfil': 'registrar-perfil',
                'jugar': 'jugar',
                'listar': 'listar'
            }
        })
        .constant('toastr', window.toastr)
        .factory('servidor', Servidor)
        .controller('MainController', MainController)
        .controller('ListaController', ListaController)
        .controller('FuentesController', FuentesController)
        .controller('IngresarController', IngresarController)
        .controller('IntegrantesController', IntegrantesController);

    function MainController($log, $http, $uibModal, $timeout, toastr, servidor) {
        var vm = this;

        vm.perfil = null;
        vm.numeros = [];
        vm.jugando = false;
        vm.apuesta = null;
        vm.ganancia = null;
        vm.seleccionados = 0;
        vm.coincidencias = null;
        
        vm.jugar = jugar;
        vm.salir = salir;
        vm.cssClass = cssClass;
        vm.desactivar = desactivar;
        vm.nuevoJuego = nuevoJuego;
        vm.seleccionar = seleccionar;
        vm.mostrarLista = mostrarLista;
        vm.mostrarIntegrantes = mostrarIntegrantes;
        vm.mostrarCodigoFuente = mostrarCodigoFuente;
        
        initialize();

        function salir() {
            vm.jugando = false;
            vm.seleccionados = 0;
            vm.perfil = null;
            vm.numeros = [];
            vm.apuesta = null;
            vm.coincidencias = null;
            vm.ganancia = null;
            initialize();
        }
        
        function initialize() {
            abrirModalIngresar().then(function (perfil) {
                vm.perfil = perfil;
                generarNumeros();
                $timeout(function () {
                    $("#apuesta").focus();
                }, 300);
            });
        }
        
        function mostrarLista() {
            $uibModal.open({
                templateUrl: 'Lista.html',
                controller: 'ListaController',
                controllerAs: 'vm',
                bindToController: true
            });
        }
        
        function mostrarIntegrantes() {
            $uibModal.open({
                templateUrl: 'Integrantes.html',
                controller: 'IntegrantesController',
                controllerAs: 'vm',
                bindToController: true
            });
        }
        
        function mostrarCodigoFuente() {
            $uibModal.open({
                templateUrl: 'Fuentes.html',
                controller: 'FuentesController',
                controllerAs: 'vm',
                bindToController: true,
                size: 'lg'
            });
        }

        function abrirModalIngresar() {
            return $uibModal.open({
                keyboard: false,
                backdrop: 'static',
                templateUrl: 'Ingresar.html',
                controller: 'IngresarController',
                controllerAs: 'vm',
                bindToController: true
            }).result;
        }

        function generarNumeros() {
            for (var i = 1; i <= 80; i++) {
                vm.numeros.push({ valor: i });
                if (i % 8 == 0) {
                    vm.numeros.push({ valor: 0 });
                }
            }
        }

        function obtenerNumerosSeleccionados() {
            var numeros = [];
            for (var i = 0; i < vm.numeros.length; i++) {
                var numero = vm.numeros[i];
                if (numero.seleccionado) {
                    numeros.push(numero.valor);
                }
            }
            return numeros;
        }

        function jugar() {
            vm.jugando = true;
            var numeros = obtenerNumerosSeleccionados();
            servidor.jugar(vm.perfil.nickname, vm.apuesta, numeros).success(procesarResultados).error(errorAlJugar);
        }

        function procesarResultados(datos) {
            if (datos.resultado) {

                for (var i = 0; i < datos.numeros.length; i++) {
                    var numeroGenerado = datos.numeros[i];

                    for (var j = 0; j < vm.numeros.length; j++) {
                        var numero = vm.numeros[j];
                        if (numero.valor === numeroGenerado) {
                            numero.generado = true;
                        }
                    }
                }

                vm.ganancia = datos.ganancias;
                vm.coincidencias = datos.coincidencias;
                vm.perfil.saldoActual = datos.saldoActual;
            }
        }

        function errorAlJugar(errorData) {
            vm.jugando = false;
            $log.error(errorData);
            toastr.error('Ocurrió un error al tratar de jugar' + (errorData.mensaje ? ' ' + errorData.mensaje : ''), 'Error');
        }
        
        function nuevoJuego() {
            
            vm.jugando = false;
            vm.seleccionados = 0;
            vm.coincidencias = null;
            vm.ganancia = null;
            vm.apuesta = null;
        
            for (var i = 0; i < vm.numeros.length; i++) {
                var numero = vm.numeros[i];
                numero.seleccionado = false;
                numero.generado = false;
            }
            
            $timeout(function () {
                $("#apuesta").focus();
            }, 300);
        }

        function cssClass(numero) {
            return {
                'btn-warning': numero.seleccionado && !numero.generado,
                'btn-success': !numero.seleccionado && numero.generado,
                'btn-danger': numero.seleccionado && numero.generado,
                'btn-default': !numero.seleccionado && !numero.generado,
            };
        }

        function seleccionar(numero) {
            numero.seleccionado = !numero.seleccionado;

            if (numero.seleccionado) {
                vm.seleccionados++;
            } else {
                vm.seleccionados--;
            }
        }

        function desactivar(numero) {
            return (!numero.seleccionado && vm.seleccionados >= 10) || vm.jugando;
        }

    }

    function IngresarController($log, $uibModalInstance, $scope, $timeout, toastr, servidor) {
        var vm = this;

        vm.consultado = false;
        vm.trabajando = false;
        vm.identificado = false;
        vm.nickname = null;
        vm.saldoInicial = null;
        vm.saldoActual = null;
        vm.aceptar = aceptar;
        vm.identificar = identificar;
        vm.desactivarIdentificar = desactivarIdentificar;
        vm.desactivarAceptar = desactivarAceptar;
        vm.desactivarSaldoInicial = desactivarSaldoInicial;

        initialize();

        function initialize() {
            $scope.$watch('vm.nickname', function () {
                vm.consultado = false;
                vm.trabajando = false;
                vm.identificado = false;
                vm.consultado = false;
                vm.saldoInicial = null;
                vm.saldoActual = null;
            });

            $timeout(function () {
                $("#nickname").focus();
            }, 300);
        }

        function identificar() {
            vm.trabajando = true;
            servidor.obtenerPerfil(vm.nickname).success(cargarPerfil).error(errorAlCargarPerfil).finally(function () { vm.trabajando = false; });
        }

        function cargarPerfil(perfil) {
            vm.consultado = true;
            if (perfil.resultado) {
                vm.nickname = perfil.nickname;
                vm.saldoInicial = perfil.saldoInicial;
                vm.saldoActual = perfil.saldoActual;
                vm.identificado = true;
                aceptar();
            } else {
                vm.identificado = false;
                $timeout(function () {
                    $("#saldo-inicial").focus();
                }, 300);
            }
        }

        function errorAlCargarPerfil(errorData) {
            $log.error(errorData);
            toastr.error('Ocurrió un error al tratar de cargar el perfil' + (errorData.mensaje ? ' ' + errorData.mensaje : ''), 'Error');
        }

        function errorAlRegistrarPerfil(errorData) {
            $log.error(errorData);
            toastr.error('Ocurrió un error al tratar de registrar el perfil' + (errorData.mensaje ? ' ' + errorData.mensaje : ''), 'Error');
        }

        function aceptar() {

            if (!vm.saldoInicial) {
                identificar();
            } else {
                if (vm.identificado) {
                    cerrarModal();
                }
                else {
                    vm.trabajando = true;
                    servidor.registrarPerfil(vm.nickname, vm.saldoInicial).success(cargarPerfil).error(errorAlRegistrarPerfil).finally(function () { vm.trabajando = false; });
                }
            }
        }

        function cerrarModal() {
            $uibModalInstance.close({
                nickname: vm.nickname,
                saldoInicial: vm.saldoInicial,
                saldoActual: vm.saldoActual
            });
        }

        function desactivarIdentificar() {
            return !vm.nickname || vm.identificado || vm.trabajando || vm.consultado;
        }

        function desactivarSaldoInicial() {
            return !vm.nickname || vm.identificado || vm.trabajando || !vm.consultado;
        }

        function desactivarAceptar() {
            return vm.saldoInicial <= 0 || vm.trabajando;
        }
    }
    
    function ListaController($log, $uibModalInstance, toastr, servidor) {
        
        var vm = this;
        vm.registros = [];
        
        vm.cerrar = cerrar;
        
        initialize();
        
        function initialize() {
            servidor.listar().success(cargarListado).error(errorAlCargarListado);
        }
        
        function cargarListado(registros) {
            vm.registros = registros;
        }
        
        function cerrar() {
            $uibModalInstance.dismiss();
        }
        
        function errorAlCargarListado(errorData) {
            $log.error(errorData);
            toastr.error('Ocurrió un error al tratar de registrar el perfil' + (errorData.mensaje ? ' ' + errorData.mensaje : ''), 'Error');
        }
    }
    
    function IntegrantesController($uibModalInstance) {
        
        var vm = this;
        
        // ordenados por carnet.
        // si las tildes no aparecen bien en el html:
        // á = \u00e1
        // é = \u00e9
        // í = \u00ed
        // ó = \u00f3
        // ú = \u00fa
        // ñ = \u00f1
        // por ejemplo para escribir Román = Rom\u00e1n
        vm.integrantes = [
            { nombre: 'Jorge David Vel\u00e1quez Sim', carnet: '090-93-33335' },
            { nombre: 'Miguel Eduardo Rom\u00e1n Mart\u00ednez', carnet: '090-03-4873' },
            { nombre: 'Jos\u00e9 Eduardo Cabrera Ipi\u00f1a', carnet: '090-10-2854' },
            { nombre: 'Mario Coronado', carnet: '' }
        ];
        
        vm.cerrar = cerrar;
        
        function cerrar() {
            $uibModalInstance.dismiss();
        }
    }
    
    function FuentesController($http, $uibModalInstance) {
        
        var vm = this;
        
        vm.servidorPhp = null;
        vm.indexHtml = null;
        vm.indexJs = null;
        vm.kenoCss = null;
        
        vm.cerrar = cerrar;
        
        initialize();
        
        function initialize() {
            $http.get('index.html').success(function (html) { vm.indexHtml = html; });
            $http.get('js/index.js').success(function (js) { vm.indexJs = js; });
            $http.get('css/keno.css').success(function (css) { vm.kenoCss = css; });
            $http.get('servidor.php.txt').success(function (php) { vm.servidorPhp = php; });
        }
        
        function cerrar() {
            $uibModalInstance.dismiss();
        }
    }

    function Servidor($http, config) {
        var operaciones = config.operaciones;
        var service = {
            obtenerPerfil: obtenerPerfil,
            registrarPerfil: registrarPerfil,
            jugar: jugar,
            listar: listar
        };

        return service;

        function listar() {
            return postData(config.servidor, { operacion: operaciones['listar'] });
        }
        
        function jugar(nickname, apuesta, numeros) {
            return postData(config.servidor, { operacion: operaciones['jugar'], nickname: nickname, apuesta: apuesta, numeros: numeros });
        }

        function obtenerPerfil(nickname) {
            return postData(config.servidor, { operacion: operaciones['obtener-perfil'], nickname: nickname });
        }

        function registrarPerfil(nickname, saldoInicial) {
            return postData(config.servidor, { operacion: operaciones['registrar-perfil'], nickname: nickname, saldoInicial: saldoInicial });
        }

        function postData(url, data) {
            return $http({
                method: 'POST',
                url: url,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                transformRequest: function (obj) {
                    var str = [];
                    for (var p in obj)
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                },
                data: { data: JSON.stringify(data) }
            });
        }
    }



})();