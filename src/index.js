(function() {
	'use strict';
	
	angular
		.module('keno', ['ui.bootstrap'])
		.controller('MainController', MainController)
		.controller('IngresarController', IngresarController);
	
	function MainController($http, $uibModal) {
		var vm = this;
		
		var seleccionados = 0;
		
		vm.numeros = [];
		vm.cssClass = cssClass;
		vm.seleccionar = seleccionar;
		vm.desactivar = desactivar;
		
		initialize();
		
		function initialize() {
			abrirModalIngresar().then(function () {
				
			});
		}
		
		function abrirModalIngresar() {
			return $uibModal.open({
				keyboard: false,
				backdrop: 'static',
				templateUrl: 'Ingresar.html',
			}).result;
		}
		
		function generarNumeros() {
			for (var i = 1; i <= 80; i++) {
				vm.numeros.push({ valor: i });
				if (i % 8 == 0){
					vm.numeros.push({ valor: 0 });
				}
			}
		}
		
		function cssClass(numero){
			return { 
				'btn-warning': numero.seleccionado && !numero.generado, 
				'btn-success': !numero.seleccionado && numero.generado, 
				'btn-danger': numero.seleccionado && numero.generado, 
				'btn-default': !numero.seleccionado && !numero.generado,
				};
		}
		
		function seleccionar(numero) {
			numero.seleccionado = !numero.seleccionado;
			
			if (numero.seleccionado){
				seleccionados++;
			} else {
				seleccionados--;
			}
		}
		
		function desactivar(numero) {
			return !numero.seleccionado && seleccionados >= 10;
		}
	}
	
	function IngresarController() {
		
	}
	
})();