function validarIP(ip) {
    var regexIP = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return regexIP.test(ip);
}

function validarMascara(mascara) {
    var regexMascara = /^(255|254|252|248|240|224|192|128|0)\.(255|254|252|248|240|224|192|128|0)\.(255|254|252|248|240|224|192|128|0)\.(255|254|252|248|240|224|192|128|0)$/;
    if (!regexMascara.test(mascara)) {
        return false;
    }

    // Converte a máscara para binário e verifica se é contígua
    var partes = mascara.split('.').map(Number);
    var binario = partes.map(parte => parte.toString(2).padStart(8, '0')).join('');
    var padraoValido = /^1+0+$/;
    return padraoValido.test(binario);
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

function mesmoSubrede(ip1, mascara1, ip2) {
    var subredeIp1 = calcularSubrede(ip1, mascara1);
    var subredeIp2 = calcularSubrede(ip2, mascara1);
    return subredeIp1 === subredeIp2;
}

function enderecoReservado(ip, mascara) {
    var enderecoDeRede = calcularSubrede(ip, mascara);
    var enderecoDeBroadcast = obterEnderecoDeBroadcast(ip, mascara);
    return ip === enderecoDeRede || ip === enderecoDeBroadcast;
}

function ipEspecial(ip) {
    var partes = ip.split('.').map(Number);
    // Verifica se é loopback (127.0.0.0/8)
    if (partes[0] === 127) {
        return true;
    }
    // Verifica se é multicast (224.0.0.0 a 239.255.255.255)
    if (partes[0] >= 224 && partes[0] <= 239) {
        return true;
    }
    return false;
}

function ping(ipDestino) {
    var resultado = document.getElementById("resultado");
    resultado.textContent += "Enviando ICMP Echo Request para " + ipDestino + "...\n";
    resultado.textContent += "Recebido ICMP Echo Reply de " + ipDestino + "\n\n";
}

function exibirResumo(ip1, mascara1, gateway, ip2, mascara2, resultadoValidacao) {
    var resumo = `
=== Resumo da Configuração ===

Máquina 1:
- IP: ${ip1}
- Máscara: ${mascara1}
- Gateway: ${gateway}

Máquina 2:
- IP: ${ip2}
- Máscara: ${mascara2}

=== Resultados ===
${resultadoValidacao}
`;

    var resultadoElemento = document.getElementById("resultado");
    resultadoElemento.textContent = resumo;
}

function configurarRede() {
    var ip1 = document.getElementById("ip1").value;
    var mascara1 = document.getElementById("mascara1").value;
    var gateway = document.getElementById("gateway").value;

    var ip2 = document.getElementById("ip2").value;
    var mascara2 = document.getElementById("mascara2").value;

    var resultadoValidacao = '';

    // Validações para Máquina 1
    if (!validarIP(ip1)) {
        resultadoValidacao += "Máquina 1: Endereço IP inválido.\n";
    }
    if (!validarMascara(mascara1)) {
        resultadoValidacao += "Máquina 1: Máscara de sub-rede inválida.\n";
    }
    if (!validarIP(gateway)) {
        resultadoValidacao += "Máquina 1: Gateway inválido.\n";
    }
    if (ipEspecial(ip1)) {
        resultadoValidacao += "Máquina 1: Endereço IP é de loopback ou multicast.\n";
    }

    // Validações para Máquina 2
    if (!validarIP(ip2)) {
        resultadoValidacao += "Máquina 2: Endereço IP inválido.\n";
    }
    if (!validarMascara(mascara2)) {
        resultadoValidacao += "Máquina 2: Máscara de sub-rede inválida.\n";
    }
    if (ipEspecial(ip2)) {
        resultadoValidacao += "Máquina 2: Endereço IP é de loopback ou multicast.\n";
    }

    // Verificações adicionais
    if (validarIP(ip1) && validarMascara(mascara1) && validarIP(gateway)) {
        if (!mesmoSubrede(ip1, mascara1, gateway)) {
            resultadoValidacao += "Máquina 1: Gateway não está na mesma sub-rede.\n";
        }
        if (enderecoReservado(ip1, mascara1)) {
            resultadoValidacao += "Máquina 1: Endereço IP é reservado (rede ou broadcast).\n";
        }
        if (enderecoReservado(gateway, mascara1)) {
            resultadoValidacao += "Máquina 1: Gateway é um endereço reservado.\n";
        }
    }

    if (validarIP(ip2) && validarMascara(mascara2)) {
        if (enderecoReservado(ip2, mascara2)) {
            resultadoValidacao += "Máquina 2: Endereço IP é reservado (rede ou broadcast).\n";
        }
    }

    if (ip1 === ip2) {
        resultadoValidacao += "Os endereços IP das máquinas não podem ser iguais.\n";
    }

    // Verifica se as máquinas estão na mesma sub-rede
    if (validarIP(ip1) && validarMascara(mascara1) && validarIP(ip2) && validarMascara(mascara2)) {
        if (!mesmoSubrede(ip1, mascara1, ip2)) {
            resultadoValidacao += "Máquina 1 e Máquina 2 não estão na mesma sub-rede.\n";
        }
    }

    // Se todas as validações passarem
    if (resultadoValidacao === '') {
        resultadoValidacao = "Configuração válida!\n";

        // Simulação de ping entre as máquinas
        resultadoValidacao += "\nSimulação de Ping:\n";
        resultadoValidacao += `Enviando ICMP Echo Request para ${ip2}...\n`;
        resultadoValidacao += `Recebido ICMP Echo Reply de ${ip2}\n\n`;
        resultadoValidacao += `Enviando ICMP Echo Request para ${ip1}...\n`;
        resultadoValidacao += `Recebido ICMP Echo Reply de ${ip1}\n`;
    }

    // Exibir resumo
    exibirResumo(ip1, mascara1, gateway, ip2, mascara2, resultadoValidacao);
}

