// Atlas Corporal - lógica da calculadora (JavaScript puro, sem módulos:
// funciona abrindo o calculadora.html direto no navegador, via file://)

var MAXIMO_PESSOAS = 6;

// Campos do formulário. "tipo" decide a dica que aparece embaixo de cada um.
var CAMPOS = [
  { chave: 'nome',        rotulo: 'Nome (opcional)',    unidade: '',     modo: 'text',    dica: 'Aparece nas abas e na comparação' },
  { chave: 'idade',       rotulo: 'Idade',              unidade: 'anos', modo: 'decimal', dica: 'Entra no cálculo' },
  { chave: 'altura',      rotulo: 'Altura',             unidade: 'cm',   modo: 'decimal', dica: 'Entra no cálculo' },
  { chave: 'peso',        rotulo: 'Peso',               unidade: 'kg',   modo: 'decimal', dica: 'Entra no cálculo' },
  { chave: 'cintura',     rotulo: 'Cintura',            unidade: 'cm',   modo: 'decimal', dica: 'Entra no cálculo' },
  { chave: 'quadril',     rotulo: 'Quadril',            unidade: 'cm',   modo: 'decimal', dica: 'Cálculo feminino e proporção' },
  { chave: 'pescoco',     rotulo: 'Pescoço (opcional)', unidade: 'cm',   modo: 'decimal', dica: 'Opcional: deixa a estimativa mais precisa' },
  { chave: 'peitoral',    rotulo: 'Peitoral',           unidade: 'cm',   modo: 'decimal', dica: 'Acompanhamento' },
  { chave: 'biceps',      rotulo: 'Bíceps',             unidade: 'cm',   modo: 'decimal', dica: 'Acompanhamento' },
  { chave: 'antebraco',   rotulo: 'Antebraço',          unidade: 'cm',   modo: 'decimal', dica: 'Acompanhamento' },
  { chave: 'coxa',        rotulo: 'Coxa',               unidade: 'cm',   modo: 'decimal', dica: 'Acompanhamento' },
  { chave: 'panturrilha', rotulo: 'Panturrilha',        unidade: 'cm',   modo: 'decimal', dica: 'Acompanhamento' }
];

function pessoaVazia() {
  return { nome: '', sexo: 'M', idade: '', altura: '', peso: '', cintura: '', quadril: '',
           pescoco: '', peitoral: '', biceps: '', antebraco: '', coxa: '', panturrilha: '' };
}

var estado = {
  quantidade: 1,
  ativa: 0,
  pessoas: []
};

for (var i = 0; i < MAXIMO_PESSOAS; i++) estado.pessoas.push(pessoaVazia());

// A Pessoa 1 já começa com valores de exemplo. Troque por outros ou apague.
estado.pessoas[0] = {
  nome: '', sexo: 'M', idade: '18', altura: '174', peso: '58', cintura: '67', quadril: '82',
  pescoco: '', peitoral: '77', biceps: '25', antebraco: '24', coxa: '54', panturrilha: '33'
};

// ---------- Utilitários ----------

function paraNumero(texto) {
  var n = parseFloat(String(texto).replace(',', '.'));
  return isFinite(n) ? n : NaN;
}

function formatar(n) {
  return n.toFixed(1).replace('.', ',');
}

function limitar(n) {
  return Math.min(60, Math.max(2, n));
}

function escapar(texto) {
  return String(texto)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function nomeDe(pessoa, indice) {
  var nome = pessoa.nome.trim();
  return nome ? nome : 'Pessoa ' + (indice + 1);
}

// ---------- Cálculo ----------
// Método principal: fórmula de Deurenberg (usa IMC, idade e sexo).
// Se o pescoço for preenchido, soma o método da Marinha dos EUA (usa circunferências)
// e o resultado final é a média dos dois.

function calcular(p) {
  var homem = p.sexo === 'M';
  var idade = paraNumero(p.idade);
  var altura = paraNumero(p.altura);
  var peso = paraNumero(p.peso);
  var cintura = paraNumero(p.cintura);
  var quadril = paraNumero(p.quadril);
  var pescoco = paraNumero(p.pescoco);

  if (!(idade > 0 && altura > 0 && peso > 0 && cintura > 0)) return { ok: false };

  var imc = peso / Math.pow(altura / 100, 2);

  var metodos = [{
    nome: 'Fórmula de Deurenberg (IMC, idade e sexo)',
    valor: 1.20 * imc + 0.23 * idade - 10.8 * (homem ? 1 : 0) - 5.4
  }];

  var marinha = NaN;
  if (pescoco > 0) {
    if (homem && cintura - pescoco > 0) {
      marinha = 495 / (1.0324 - 0.19077 * Math.log10(cintura - pescoco) + 0.15456 * Math.log10(altura)) - 450;
    }
    if (!homem && quadril > 0 && cintura + quadril - pescoco > 0) {
      marinha = 495 / (1.29579 - 0.35004 * Math.log10(cintura + quadril - pescoco) + 0.22100 * Math.log10(altura)) - 450;
    }
  }
  if (isFinite(marinha)) {
    metodos.push({ nome: 'Método da Marinha dos EUA (circunferências)', valor: marinha });
  }

  var soma = 0;
  metodos.forEach(function (m) { soma += m.valor; });
  var gordura = limitar(soma / metodos.length);
  var kgGordura = peso * gordura / 100;

  // Limites das faixas (gordura em %): atlético, fitness, médio, acima da média
  var lim = homem ? [6, 14, 18, 25] : [14, 21, 25, 32];
  var faixa;
  if (gordura < lim[0]) faixa = 'Abaixo da faixa atlética';
  else if (gordura < lim[1]) faixa = 'Atlético';
  else if (gordura < lim[2]) faixa = 'Fitness';
  else if (gordura < lim[3]) faixa = 'Médio';
  else faixa = 'Acima da média';

  var classeImc;
  if (imc < 18.5) classeImc = 'abaixo do peso';
  else if (imc < 25) classeImc = 'peso normal';
  else if (imc < 30) classeImc = 'sobrepeso';
  else classeImc = 'obesidade';

  return {
    ok: true,
    gordura: gordura,
    kgGordura: kgGordura,
    kgMagra: peso - kgGordura,
    faixa: faixa,
    imc: imc,
    classeImc: classeImc,
    cinturaQuadril: quadril > 0 ? cintura / quadril : NaN,
    cinturaAltura: cintura / altura,
    metodos: metodos
  };
}

// ---------- Desenho da tela ----------

function porId(id) { return document.getElementById(id); }

function desenharContadores() {
  var caixa = porId('counts');
  caixa.innerHTML = '';
  for (var n = 1; n <= MAXIMO_PESSOAS; n++) {
    (function (n) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'count-btn';
      b.textContent = n;
      b.setAttribute('aria-pressed', estado.quantidade === n ? 'true' : 'false');
      b.addEventListener('click', function () {
        estado.quantidade = n;
        if (estado.ativa > n - 1) estado.ativa = n - 1;
        desenharTudo();
      });
      caixa.appendChild(b);
    })(n);
  }
}

function desenharAbas() {
  var grupo = porId('tabs-group');
  var caixa = porId('tabs');
  grupo.hidden = estado.quantidade < 2;
  caixa.innerHTML = '';
  for (var i = 0; i < estado.quantidade; i++) {
    (function (i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'tab-btn';
      b.textContent = nomeDe(estado.pessoas[i], i);
      b.setAttribute('aria-pressed', estado.ativa === i ? 'true' : 'false');
      b.addEventListener('click', function () {
        estado.ativa = i;
        desenharTudo();
      });
      caixa.appendChild(b);
    })(i);
  }
}

function desenharSexo() {
  var p = estado.pessoas[estado.ativa];
  porId('sex-M').setAttribute('aria-pressed', p.sexo === 'M' ? 'true' : 'false');
  porId('sex-F').setAttribute('aria-pressed', p.sexo === 'F' ? 'true' : 'false');
}

// Os campos só são refeitos ao trocar de pessoa, para não perder o foco enquanto digita.
function desenharCampos() {
  var p = estado.pessoas[estado.ativa];
  var caixa = porId('fields');
  caixa.innerHTML = '';

  CAMPOS.forEach(function (campo) {
    var id = 'campo-' + estado.ativa + '-' + campo.chave;
    var div = document.createElement('div');
    div.className = 'field';
    div.innerHTML =
      '<label for="' + id + '">' + campo.rotulo + '</label>' +
      '<div class="input-row">' +
        '<input id="' + id + '" type="text" inputmode="' + campo.modo + '" value="' + escapar(p[campo.chave]) + '">' +
        '<span class="unit">' + campo.unidade + '</span>' +
      '</div>' +
      '<span class="hint">' + campo.dica + '</span>';

    div.querySelector('input').addEventListener('input', function (e) {
      estado.pessoas[estado.ativa][campo.chave] = e.target.value;
      desenharAbas();
      desenharResultados();
    });
    caixa.appendChild(div);
  });
}

function desenharResultado() {
  var p = estado.pessoas[estado.ativa];
  var r = calcular(p);
  var nome = nomeDe(p, estado.ativa);

  porId('result-title').textContent = estado.quantidade > 1 ? 'Resultado de ' + nome : 'Seu resultado';

  if (!r.ok) {
    porId('result').innerHTML = '<p class="empty-msg">Preencha idade, altura, peso e cintura para ver o resultado.</p>';
    return;
  }

  var linhasMetodos = r.metodos.map(function (m) {
    return '<div class="line"><span>' + m.nome + '</span><strong>' + formatar(limitar(m.valor)) + '%</strong></div>';
  }).join('');

  porId('result').innerHTML =
    '<div style="display:flex; flex-direction:column; gap:24px">' +
      '<div class="big-numbers">' +
        '<div class="big"><span class="label">Gordura corporal</span><span class="value fat">' + formatar(r.gordura) + '%</span></div>' +
        '<div class="big"><span class="label">Massa magra</span><span class="value lean">' + formatar(100 - r.gordura) + '%</span></div>' +
      '</div>' +
      '<div class="bar" role="img" aria-label="Divisão entre massa magra e gordura">' +
        '<div class="lean-bar" style="width:' + (100 - r.gordura).toFixed(1) + '%"></div>' +
        '<div class="fat-bar" style="width:' + r.gordura.toFixed(1) + '%"></div>' +
      '</div>' +
      '<div class="mini-cards">' +
        '<div class="mini"><span class="label">Massa magra</span><span class="value">' + formatar(r.kgMagra) + ' kg</span></div>' +
        '<div class="mini"><span class="label">Gordura</span><span class="value">' + formatar(r.kgGordura) + ' kg</span></div>' +
      '</div>' +
      '<div class="category"><span class="label">Faixa de classificação</span><span class="value">' + r.faixa + '</span></div>' +
      '<div class="methods"><span class="label">Como chegamos a esse número</span>' + linhasMetodos + '</div>' +
    '</div>';
}

function desenharComparacao() {
  var secao = porId('compare-section');
  secao.hidden = estado.quantidade < 2;
  if (estado.quantidade < 2) return;

  var html = '';
  for (var i = 0; i < estado.quantidade; i++) {
    var p = estado.pessoas[i];
    var r = calcular(p);
    var nome = escapar(nomeDe(p, i));
    if (r.ok) {
      html += '<div class="compare-row"><span class="who">' + nome + '</span>' +
        '<div class="cell"><small>Gordura</small><strong class="fat">' + formatar(r.gordura) + '%</strong></div>' +
        '<div class="cell"><small>Massa magra</small><strong class="lean">' + formatar(100 - r.gordura) + '%</strong></div>' +
        '<div class="cell"><small>Magra em kg</small><strong>' + formatar(r.kgMagra) + ' kg</strong></div>' +
        '<div class="cell"><small>Faixa</small><strong style="font-size:18px">' + r.faixa + '</strong></div></div>';
    } else {
      html += '<div class="compare-row"><span class="who">' + nome + '</span>' +
        '<div class="cell"><small>Situação</small><strong style="font-size:18px">Dados incompletos</strong></div></div>';
    }
  }
  porId('compare').innerHTML = html;
}

function desenharProporcoes() {
  var p = estado.pessoas[estado.ativa];
  var r = calcular(p);
  var nome = escapar(nomeDe(p, estado.ativa));

  porId('ratios-title').innerHTML = 'Proporções do corpo · ' + nome;
  porId('track-title').innerHTML = 'Medidas para acompanhar · ' + nome;

  if (!r.ok) {
    porId('ratios').innerHTML = '';
  } else {
    var rcq = isFinite(r.cinturaQuadril) ? r.cinturaQuadril.toFixed(2).replace('.', ',') : '–';
    porId('ratios').innerHTML =
      '<div class="stat"><span class="label">IMC</span><span class="value">' + formatar(r.imc) + '</span><span class="note2">Classificação: ' + r.classeImc + '</span></div>' +
      '<div class="stat"><span class="label">Cintura / quadril</span><span class="value">' + rcq + '</span><span class="note2">Mostra onde a gordura se concentra</span></div>' +
      '<div class="stat"><span class="label">Cintura / altura</span><span class="value">' + r.cinturaAltura.toFixed(2).replace('.', ',') + '</span><span class="note2">Abaixo de 0,50 é o esperado</span></div>';
  }

  var medidas = [['Peitoral', p.peitoral], ['Bíceps', p.biceps], ['Antebraço', p.antebraco], ['Coxa', p.coxa], ['Panturrilha', p.panturrilha]];
  porId('track').innerHTML = medidas.map(function (m) {
    return '<div class="track"><span class="label">' + m[0] + '</span><span class="value">' + escapar(m[1] || '–') + ' cm</span></div>';
  }).join('');
}

function desenharResultados() {
  desenharResultado();
  desenharComparacao();
  desenharProporcoes();
}

function desenharTudo() {
  desenharContadores();
  desenharAbas();
  desenharSexo();
  desenharCampos();
  desenharResultados();
}

// ---------- Início ----------

porId('sex-M').addEventListener('click', function () {
  estado.pessoas[estado.ativa].sexo = 'M';
  desenharSexo();
  desenharResultados();
});
porId('sex-F').addEventListener('click', function () {
  estado.pessoas[estado.ativa].sexo = 'F';
  desenharSexo();
  desenharResultados();
});

desenharTudo();
