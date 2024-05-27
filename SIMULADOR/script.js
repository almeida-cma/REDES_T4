function validarIP(ip) {
    var regexIP = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return regexIP.test(ip);
}

function validarMascara(mascara) {
    var regexMascara = /^(255|254|252|248|240|224|192|128|0)\.(255|254|252|248|240|224|192|128|0)\.(255|254|252|248|240|224|192|128|0)\.(255|254|252|248|240|224|192|128|0)$/;
    return regexMascara.test(mascara);
}

function calcularSubrede(ip, mascara) {
    var ipPartes = ip.split('.').map(Number);
    var mascaraPartes = mascara.split('.').map(Number);
    var subrede = ipPartes.map((parte, index) => parte & mascaraPartes[index]);
    return subrede.join('.');
}

function obterEnderecoDeBroadcast(ip, mascara) {
    var ipPartes = ip.split('.').map(Number);
    var mascaraPartes = mascara.split('.').map(Number);
    var broadcast = ipPartes.map((parte, index) => parte | (~mascaraPartes[index] & 255));
    return broadcast.join('.');
}

function mesmoSubrede(ip1, mascara1, gateway) {
    var subredeIp1 = calcularSubrede(ip1, mascara1);
    var subredeGateway = calcularSubrede(gateway, mascara1);
    return subredeIp1 === subredeGateway;
}

function enderecoReservado(ip, mascara) {
    var enderecoDeRede = calcularSubrede(ip, mascara);
    var enderecoDeBroadcast = obterEnderecoDeBroadcast(ip, mascara);
    return ip === enderecoDeRede || ip === enderecoDeBroadcast;
}

function ping(ipDestino) {
    // Simulação do comando ping (apenas para exemplo)
    var resultado = document.getElementById("resultado");
    resultado.innerHTML += "Enviando ICMP Echo Request para " + ipDestino + "...<br>";
    resultado.innerHTML += "Recebido ICMP Echo Reply de " + ipDestino + "<br><br>";
}

function configurarRede() {
    var ip1 = document.getElementById("ip1").value;
    var mascara1 = document.getElementById("mascara1").value;
    var gateway = document.getElementById("gateway").value;

    var ip2 = document.getElementById("ip2").value;
    var mascara2 = document.getElementById("mascara2").value;

    var resultado = document.getElementById("resultado");
    resultado.innerHTML = '';

    if (!validarIP(ip1) || !validarMascara(mascara1) || !validarIP(gateway)) {
        resultado.innerHTML += "Máquina 1: Configuração inválida.<br>";
    }

    if (!validarIP(ip2) || !validarMascara(mascara2)) {
        resultado.innerHTML += "Máquina 2: Configuração inválida.<br>";
    }

    if (!mesmoSubrede(ip1, mascara1, gateway)) {
        resultado.innerHTML += "Máquina 1: Gateway não está na mesma sub-rede.<br>";
    }

    if (enderecoReservado(ip1, mascara1)) {
        resultado.innerHTML += "Máquina 1: Endereço IP é um endereço reservado.<br>";
    }

    if (enderecoReservado(ip2, mascara2)) {
        resultado.innerHTML += "Máquina 2: Endereço IP é um endereço reservado.<br>";
    }

    if (enderecoReservado(gateway, mascara1)) {
        resultado.innerHTML += "Máquina 1: Gateway é um endereço reservado.<br>";
    }

    if (ip1 === ip2) {
        resultado.innerHTML += "Os endereços IP das máquinas não podem ser iguais.<br>";
    }

    if (resultado.innerHTML === '') {
        resultado.innerHTML = "Configuração válida!<br>";
        
        // Simulando ping entre as máquinas configuradas
        resultado.innerHTML += "<br>Simulação de Ping:<br>";
        ping(ip2);
        ping(ip1);
    }
}
