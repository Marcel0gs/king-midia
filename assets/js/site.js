/* =====================================================================
   King mídia: site.js
   Cada bloco fica no próprio escopo ({ }), com let/const: nome repetido
   entre blocos não apaga o outro (armadilha que quebrou a capa da Bem Viver).
   ===================================================================== */
(function () {
  "use strict";

  const html = document.documentElement;
  const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mouseFino = window.matchMedia("(pointer: fine)").matches;
  const ZAP = "5585996856906";
  const zapLink = (texto) => "https://wa.me/" + ZAP + "?text=" + encodeURIComponent(texto);

  /* ------------------------------------------------------------------ *
   * 1. ABERTURA: uma vez por sessão; clique ou Esc pula; saída de
   *    segurança aos 5 s, caso a animação não termine (aba em segundo plano).
   * ------------------------------------------------------------------ */
  {
    const abertura = document.querySelector(".abertura");
    if (abertura && !html.classList.contains("sem-abertura")) {
      try { sessionStorage.setItem("king-abertura", "1"); } catch (e) {}
      const fechar = () => {
        if (abertura.classList.contains("feita")) return;
        abertura.classList.add("feita");
        html.classList.add("sem-abertura");
        document.removeEventListener("keydown", tecla);
      };
      const tecla = (e) => { if (e.key === "Escape") fechar(); };
      if (reduzido) fechar();
      abertura.addEventListener("click", fechar);
      document.addEventListener("keydown", tecla);
      abertura.addEventListener("animationend", (e) => { if (e.animationName === "some") fechar(); });
      setTimeout(fechar, 5200);
    }
  }

  /* ------------------------------------------------------------------ *
   * 2. TOPO com fundo depois de rolar, e WhatsApp flutuante depois do hero
   * ------------------------------------------------------------------ */
  {
    const topo = document.querySelector(".topo");
    const flutuante = document.querySelector(".zap-flutuante");
    let pedido = false;
    const atualizar = () => {
      pedido = false;
      const y = window.scrollY;
      topo.classList.toggle("rolou", y > 12);
      if (flutuante) flutuante.classList.toggle("mostra", y > window.innerHeight * 0.6);
    };
    window.addEventListener("scroll", () => { if (!pedido) { pedido = true; requestAnimationFrame(atualizar); } }, { passive: true });
    atualizar();

    // some onde a página já tem o próprio botão de WhatsApp (no celular ele
    // cobria o botão do simulador)
    if (flutuante && "IntersectionObserver" in window) {
      const vistas = new Set();
      const io = new IntersectionObserver((entradas) => {
        entradas.forEach((en) => { if (en.isIntersecting) vistas.add(en.target); else vistas.delete(en.target); });
        flutuante.classList.toggle("escondido", vistas.size > 0);
      }, { threshold: 0.15 });
      document.querySelectorAll(".sim__painel, .contato").forEach((s) => io.observe(s));
    }
  }

  /* ------------------------------------------------------------------ *
   * 3. HERO COBERTO PELO SCROLL (padrão do site do Marcelo, home.js)
   *    Altura em cache, só relê no resize. --cobre vai de 0 a 1.
   * ------------------------------------------------------------------ */
  const hero = document.querySelector(".hero");
  let heroCoberto = false;
  if (hero) {
    let alturaHero = 0, inicio = 0, pedido = false;
    const atualizar = () => {
      pedido = false;
      let p = (window.scrollY - inicio) / window.innerHeight;
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      hero.style.setProperty("--cobre", reduzido ? 0 : p.toFixed(3));
      heroCoberto = p >= 1;
    };
    const medir = () => {
      alturaHero = hero.offsetHeight;
      // hero mais alto que a tela (celular): trava só depois de mostrar o fim dele
      const topo = Math.min(0, window.innerHeight - alturaHero);
      hero.style.setProperty("--hero-topo", topo + "px");
      inicio = Math.max(0, alturaHero - window.innerHeight);
      atualizar();
    };
    window.addEventListener("scroll", () => { if (!pedido) { pedido = true; requestAnimationFrame(atualizar); } }, { passive: true });
    window.addEventListener("resize", medir);
    medir();
  }

  /* ------------------------------------------------------------------ *
   * 4. TOTEM: inclina com o mouse (só mouse de verdade) e a tela roda
   *    os anúncios, com as barrinhas de story em cima e a etiqueta
   *    "Tocando agora" do lado. O relógio é a hora real de Fortaleza.
   *    O mouse também escreve --mx/--my no hero: fitas, quadrados e
   *    etiquetas andam cada um na sua profundidade.
   * ------------------------------------------------------------------ */
  {
    const corpo = document.querySelector(".totem__corpo");
    const frente = document.querySelector(".totem__frente");
    if (corpo && hero && mouseFino && !reduzido) {
      let alvoX = 0.5, alvoY = 0.5, pedido = false;
      const aplicar = () => {
        pedido = false;
        const ry = -20 + (alvoX - 0.5) * 34;
        const rx = 3 - (alvoY - 0.5) * 10;
        corpo.style.setProperty("--ry", ry.toFixed(2) + "deg");
        corpo.style.setProperty("--rx", rx.toFixed(2) + "deg");
        frente.style.setProperty("--ry-num", ry.toFixed(1));
        hero.style.setProperty("--mx", (alvoX - 0.5).toFixed(3));
        hero.style.setProperty("--my", (alvoY - 0.5).toFixed(3));
      };
      hero.addEventListener("pointermove", (e) => {
        alvoX = e.clientX / window.innerWidth;
        alvoY = e.clientY / window.innerHeight;
        if (!pedido) { pedido = true; requestAnimationFrame(aplicar); }
      });
      hero.addEventListener("pointerleave", () => { alvoX = 0.5; alvoY = 0.5; aplicar(); });
    }

    const relogio = document.querySelector("[data-relogio]");
    const data = document.querySelector("[data-data]");
    const saudacao = document.querySelector("[data-saudacao]");
    const fuso = { timeZone: "America/Fortaleza" };
    const marcarHora = () => {
      const agora = new Date();
      if (relogio) relogio.textContent = agora.toLocaleTimeString("pt-BR", Object.assign({ hour: "2-digit", minute: "2-digit" }, fuso));
      if (data) data.textContent = agora.toLocaleDateString("pt-BR", Object.assign({ weekday: "long", day: "numeric", month: "long" }, fuso));
      if (saudacao) {
        const hora = Number(agora.toLocaleString("en-US", Object.assign({ hour: "numeric", hour12: false }, fuso))) % 24;
        saudacao.textContent = hora < 5 ? "Boa noite" : hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
      }
    };
    marcarHora();
    setInterval(marcarHora, 15000);

    const player = document.querySelector("[data-player]");
    if (player) {
      const DUR = 3800;
      const slides = [...player.querySelectorAll(".slide")];
      const barras = [...player.querySelectorAll("[data-barras] i")];
      const nome = document.querySelector("[data-tocando-nome]");
      const num = document.querySelector("[data-tocando-num]");
      let i = 0;
      player.style.setProperty("--dur", DUR + "ms");
      const mostrar = (n) => {
        slides[i].classList.remove("ativo");
        i = n;
        slides[i].classList.add("ativo");
        barras.forEach((b, k) => {
          b.classList.toggle("cheia", k < i);
          b.classList.remove("corre");
        });
        if (!reduzido && barras[i]) { void barras[i].offsetWidth; barras[i].classList.add("corre"); }
        if (nome) nome.textContent = slides[i].dataset.nome;
        if (num) num.textContent = (i + 1) + "/" + slides.length;
      };
      mostrar(0);
      if (!reduzido) {
        setInterval(() => {
          if (document.hidden || heroCoberto) return;
          mostrar((i + 1) % slides.length);
        }, DUR);
      }
    }
  }

  /* ------------------------------------------------------------------ *
   * 4b. PARALLAX GERAL: [data-px] anda na vertical e [data-px-x] na
   *     horizontal, proporcional à distância do elemento até o meio da
   *     tela. A posição de cada um fica em cache (só relê no resize),
   *     então por quadro só tem conta e escrita, sem leitura de layout.
   *     Escreve em `translate`, que animação de entrada não sobrescreve.
   *     No celular, metade da força; nos feedbacks (trilho), nenhuma.
   * ------------------------------------------------------------------ */
  if (!reduzido) {
    const celular = window.matchMedia("(max-width: 860px)");
    let itens = [];
    const medir = () => {
      itens = [...document.querySelectorAll("[data-px], [data-px-x]")]
        .filter((el) => !(celular.matches && el.closest(".fb-lista")))
        .map((el) => {
          el.style.translate = "";
          const r = el.getBoundingClientRect();
          return {
            el,
            centro: r.top + window.scrollY + r.height / 2,
            vy: parseFloat(el.dataset.px || 0),
            vx: parseFloat(el.dataset.pxX || 0)
          };
        });
      document.querySelectorAll(".fb-lista [data-px]").forEach((el) => { if (celular.matches) el.style.translate = ""; });
      atualizar();
    };
    let pedido = false;
    const atualizar = () => {
      pedido = false;
      const meio = window.scrollY + window.innerHeight / 2;
      const forca = celular.matches ? 0.5 : 1;
      for (const it of itens) {
        const d = (it.centro - meio) * forca;
        if (Math.abs(d) > window.innerHeight * 1.6) continue;
        it.el.style.translate = (it.vx ? (d * -it.vx).toFixed(1) + "px " : "0 ") + (it.vy ? (d * it.vy).toFixed(1) + "px" : "0");
      }
    };
    window.addEventListener("scroll", () => { if (!pedido) { pedido = true; requestAnimationFrame(atualizar); } }, { passive: true });
    window.addEventListener("resize", medir);
    window.addEventListener("load", medir);
    medir();
  }

  /* ------------------------------------------------------------------ *
   * 4c. PALAVRA DESTACADA: a caixa roxa do <mark> pinta quando o título
   *     entra na tela. O do hero espera a abertura.
   * ------------------------------------------------------------------ */
  {
    const titulos = [...document.querySelectorAll("h1, h2, .slide__frase")].filter((t) => t.querySelector("mark"));
    if (!reduzido && "IntersectionObserver" in window) {
      titulos.forEach((t) => t.classList.add("pinta"));
      const io = new IntersectionObserver((entradas) => {
        entradas.forEach((en) => {
          if (!en.isIntersecting) return;
          const t = en.target;
          const espera = t.matches("h1") && !html.classList.contains("sem-abertura") ? 3300 : 0;
          setTimeout(() => t.classList.add("visto"), espera);
          io.unobserve(t);
        });
      }, { threshold: 0.5 });
      titulos.filter((t) => !t.closest(".slide")).forEach((t) => io.observe(t));
      // a frase do anúncio da King pinta toda vez que o anúncio volta
      const frase = document.querySelector(".slide--king .slide__frase");
      if (frase) {
        new MutationObserver(() => {
          const ativo = frase.closest(".slide").classList.contains("ativo");
          frase.classList.remove("visto");
          if (ativo) setTimeout(() => frase.classList.add("visto"), 250);
        }).observe(frase.closest(".slide"), { attributes: true, attributeFilter: ["class"] });
        setTimeout(() => frase.classList.add("visto"), html.classList.contains("sem-abertura") ? 400 : 3400);
      }
    }
  }

  /* ------------------------------------------------------------------ *
   * 4d. CURSOR (pedido dele): o anel segue o mouse com atraso, cresce
   *     sobre o que é clicável, deixa um rastro de quadradinhos roxos e
   *     solta um punhado deles no clique. Só com mouse de verdade; o
   *     cursor do sistema continua visível (acessibilidade).
   * ------------------------------------------------------------------ */
  if (mouseFino && !reduzido) {
    const caixa = document.querySelector(".cursor");
    if (caixa) {
      html.classList.add("cursor-on");
      const CORES = ["#8A3CF2", "#A45CFF", "#C9A2FF", "#6A24D9"];
      const CLICAVEL = "a, button, input, label, [role=radio], .cortina, [data-brilho]";
      let mx = -100, my = -100, ax = -100, ay = -100, rodando = false, ultimo = 0, vivos = 0;
      const quadrado = (x, y, dx, dy, t, dur) => {
        if (vivos > 40) return;
        const q = document.createElement("span");
        q.className = "rastro";
        q.style.cssText = "--x:" + x + "px;--y:" + y + "px;--x2:" + (x + dx) + "px;--y2:" + (y + dy) + "px;--t:" + t + "px;--c:" + CORES[(Math.random() * CORES.length) | 0] + ";--dur:" + dur + "ms";
        vivos++;
        q.addEventListener("animationend", () => { q.remove(); vivos--; }, { once: true });
        caixa.appendChild(q);
      };
      const passo = () => {
        ax += (mx - ax) * 0.2;
        ay += (my - ay) * 0.2;
        caixa.style.setProperty("--ax", ax.toFixed(1) + "px");
        caixa.style.setProperty("--ay", ay.toFixed(1) + "px");
        if (Math.abs(mx - ax) + Math.abs(my - ay) > 0.4) requestAnimationFrame(passo);
        else rodando = false;
      };
      document.addEventListener("pointermove", (e) => {
        if (e.pointerType !== "mouse") return;
        mx = e.clientX; my = e.clientY;
        caixa.style.setProperty("--px", mx + "px");
        caixa.style.setProperty("--py", my + "px");
        caixa.classList.remove("fora");
        if (!rodando) { rodando = true; requestAnimationFrame(passo); }
        const agora = performance.now();
        if (agora - ultimo > 45) {
          ultimo = agora;
          quadrado(mx, my, (Math.random() - 0.5) * 30, 18 + Math.random() * 22, 4 + Math.random() * 5, 700);
        }
      }, { passive: true });
      document.addEventListener("pointerover", (e) => { caixa.classList.toggle("sobre", !!e.target.closest(CLICAVEL)); });
      document.addEventListener("pointerdown", (e) => {
        if (e.pointerType !== "mouse") return;
        caixa.classList.add("apertou");
        for (let k = 0; k < 10; k++) {
          const ang = (k / 10) * Math.PI * 2 + Math.random() * 0.4;
          const dist = 40 + Math.random() * 40;
          quadrado(e.clientX, e.clientY, Math.cos(ang) * dist, Math.sin(ang) * dist, 5 + Math.random() * 6, 650);
        }
      });
      document.addEventListener("pointerup", () => caixa.classList.remove("apertou"));
      document.documentElement.addEventListener("pointerleave", () => caixa.classList.add("fora"));
    }
  }

  /* ------------------------------------------------------------------ *
   * 5. CARTÕES DE PRODUTO: a luz segue o cursor
   * ------------------------------------------------------------------ */
  if (mouseFino) {
    document.querySelectorAll("[data-brilho]").forEach((cartao) => {
      cartao.addEventListener("pointermove", (e) => {
        const r = cartao.getBoundingClientRect();
        cartao.style.setProperty("--mx", (e.clientX - r.left) + "px");
        cartao.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * 6. SIMULADOR: nome, ambiente, formato, cor e logo montam a tela;
   *    o botão leva tudo isso pro WhatsApp do comercial.
   * ------------------------------------------------------------------ */
  {
    const raiz = document.querySelector("[data-sim]");
    if (raiz) {
      const cena = raiz.querySelector("[data-sim-cena]");
      const tela = raiz.querySelector("[data-sim-tela]");
      const input = raiz.querySelector("[data-sim-input]");
      const zap = raiz.querySelector("[data-sim-zap]");
      const cta = raiz.querySelector("[data-sim-cta]");
      const logoInput = raiz.querySelector("[data-sim-logo]");
      const logoRotulo = raiz.querySelector("[data-sim-logo-rotulo]");

      const AMBIENTES = {
        restaurante: { onde: "no meu restaurante", nome: "restaurante", slides: [
          { tipo: "marca", sub: "Bem-vindo! Escolha sua mesa" },
          { tipo: "cor", etq: "hoje", titulo: "Prato do dia", sub: "pergunte ao garçom" },
          { tipo: "info", ico: "utensils", titulo: "Happy hour", sub: "de segunda a sexta, das 18h às 20h" },
          { tipo: "info", ico: "message-circle", titulo: "Peça pelo WhatsApp", sub: "delivery e retirada" }
        ] },
        loja: { onde: "na minha loja", nome: "loja", slides: [
          { tipo: "marca", sub: "Entre e fique à vontade" },
          { tipo: "cor", etq: "chegou", titulo: "Nova coleção", sub: "já nas araras" },
          { tipo: "info", ico: "shopping-bag", titulo: "Leve 3, pague 2", sub: "nas peças selecionadas" },
          { tipo: "info", ico: "instagram", titulo: "Siga a loja", sub: "@{arroba}" }
        ] },
        clinica: { onde: "na minha clínica", nome: "clínica", slides: [
          { tipo: "marca", sub: "Seja bem-vindo(a)" },
          { tipo: "senha", etq: "senha chamada", senha: "A 024", sub: "consultório 3" },
          { tipo: "info", ico: "stethoscope", titulo: "Faça seu check-in", sub: "na recepção, com documento" },
          { tipo: "info", ico: "message-circle", titulo: "Agende pelo WhatsApp", sub: "consultas e retornos" }
        ] },
        academia: { onde: "na minha academia", nome: "academia", slides: [
          { tipo: "marca", sub: "Bora treinar!" },
          { tipo: "cor", etq: "treino do dia", titulo: "Pernas + core", sub: "fale com o professor" },
          { tipo: "info", ico: "dumbbell", titulo: "Aula de bike", sub: "hoje, às 19h" },
          { tipo: "meta", etq: "meta da turma", titulo: "87%", sub: "do desafio do mês" }
        ] },
        empresa: { onde: "na minha empresa", nome: "empresa", slides: [
          { tipo: "marca", sub: "Bem-vindos" },
          { tipo: "meta", etq: "meta do mês", titulo: "87%", sub: "faltam só 13%, time!" },
          { tipo: "info", ico: "sparkles", titulo: "Aniversariantes", sub: "parabéns, Ana e Carlos!" },
          { tipo: "cor", etq: "comunicado", titulo: "Reunião geral", sub: "sexta, às 9h, no auditório" }
        ] },
        shopping: { onde: "no shopping", nome: "shopping", slides: [
          { tipo: "marca", sub: "Piso L2, ao lado da escada" },
          { tipo: "cor", etq: "só essa semana", titulo: "Liquida", sub: "até 50% nas vitrines" },
          { tipo: "info", ico: "map-pin", titulo: "Estamos aqui", sub: "siga a sinalização roxa" },
          { tipo: "info", ico: "megaphone", titulo: "Lançamento", sub: "venha conhecer" }
        ] }
      };

      const estado = { nome: "", amb: "restaurante", formato: "totem", cor: "#8A3CF2", logo: "" };
      let indice = 0;

      const nomeMostrado = () => estado.nome.trim() || "Sua Marca";
      const arroba = () => (nomeMostrado().normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "") || "suamarca");

      const el = (tag, classe, texto) => {
        const n = document.createElement(tag);
        if (classe) n.className = classe;
        if (texto != null) n.textContent = texto;
        return n;
      };
      const icone = (nome) => {
        const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        s.setAttribute("class", "ico");
        s.setAttribute("aria-hidden", "true");
        const u = document.createElementNS("http://www.w3.org/2000/svg", "use");
        u.setAttribute("href", "#i-" + nome);
        s.appendChild(u);
        return s;
      };
      const logoMarca = () => {
        const caixa = el("span", "sslide__logo");
        if (estado.logo) {
          const img = el("img");
          img.src = estado.logo;
          img.alt = "";
          caixa.appendChild(img);
        } else if (estado.nome.trim()) {
          caixa.appendChild(el("span", null, nomeMostrado().charAt(0).toUpperCase()));
        } else {
          const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          const u = document.createElementNS("http://www.w3.org/2000/svg", "use");
          u.setAttribute("href", "#king-coroa");
          s.appendChild(u);
          caixa.appendChild(s);
        }
        return caixa;
      };

      const montarSlide = (d) => {
        const s = el("div", "sslide sslide--" + d.tipo);
        const sub = (d.sub || "").replace("{arroba}", arroba());
        if (d.tipo === "marca") {
          s.appendChild(logoMarca());
          s.appendChild(el("p", "sslide__nome", nomeMostrado()));
          s.appendChild(el("p", "sslide__sub", sub));
          return s;
        }
        if (d.tipo === "cor") {
          s.appendChild(el("p", "sslide__etq", d.etq));
          s.appendChild(el("p", "sslide__titulo", d.titulo));
          s.appendChild(el("p", "sslide__sub", sub));
        } else if (d.tipo === "senha") {
          s.appendChild(el("p", "sslide__etq", d.etq));
          s.appendChild(el("p", "sslide__senha", d.senha));
          s.appendChild(el("p", "sslide__sub", sub));
        } else if (d.tipo === "meta") {
          s.appendChild(el("p", "sslide__etq", d.etq));
          s.appendChild(el("p", "sslide__senha", d.titulo));
          const barra = el("span", "sslide__barra");
          barra.appendChild(el("i"));
          s.appendChild(barra);
          s.appendChild(el("p", "sslide__sub", sub));
        } else {
          const ic = el("span", "sslide__ico");
          ic.appendChild(icone(d.ico));
          s.appendChild(ic);
          s.appendChild(el("p", "sslide__titulo", d.titulo));
          s.appendChild(el("p", "sslide__sub", sub));
        }
        s.appendChild(el("p", "sslide__marca-peq", nomeMostrado()));
        return s;
      };

      const montarTela = () => {
        const lista = AMBIENTES[estado.amb].slides;
        if (indice >= lista.length) indice = 0;
        tela.replaceChildren(...lista.map(montarSlide));
        tela.children[indice].classList.add("ativo");
      };

      const atualizarCta = () => {
        const a = AMBIENTES[estado.amb];
        const aparelho = estado.formato === "totem" ? "um totem" : "uma tela de parede";
        cta.textContent = "Quero essa tela " + a.onde;
        const quem = estado.nome.trim() ? " para a " + estado.nome.trim() : "";
        zap.href = zapLink("Olá! 💜 Vim pelo site e simulei " + aparelho + quem + " (" + a.nome + "). Quero saber mais.");
      };

      const trocarFoto = (amb) => {
        cena.querySelectorAll(".sim__foto").forEach((img) => {
          const essa = img.dataset.amb === amb;
          if (essa && !img.getAttribute("src") && img.dataset.src) img.src = img.dataset.src;
          img.classList.toggle("ativa", essa);
        });
      };

      const marcarGrupo = (grupo, valor) => {
        grupo.querySelectorAll("[role=radio]").forEach((b) => {
          const sim = b.dataset.valor === valor;
          b.setAttribute("aria-checked", sim ? "true" : "false");
          b.tabIndex = sim ? 0 : -1;
        });
      };

      const grupoAmb = raiz.querySelector("[data-sim-amb]");
      const grupoFormato = raiz.querySelector("[data-sim-formato]");
      const grupoCor = raiz.querySelector("[data-sim-cor]");

      const definir = (chave, valor) => {
        estado[chave] = valor;
        if (chave === "amb") { cena.dataset.ambiente = valor; trocarFoto(valor); marcarGrupo(grupoAmb, valor); indice = 0; montarTela(); }
        if (chave === "formato") { cena.dataset.formato = valor; marcarGrupo(grupoFormato, valor); }
        if (chave === "cor") { cena.style.setProperty("--cor", valor); marcarGrupo(grupoCor, valor); }
        atualizarCta();
      };

      // grupos de rádio: clique e setas do teclado
      [[grupoAmb, "amb"], [grupoFormato, "formato"], [grupoCor, "cor"]].forEach(([grupo, chave]) => {
        grupo.addEventListener("click", (e) => {
          const b = e.target.closest("[role=radio]");
          if (b) definir(chave, b.dataset.valor);
        });
        grupo.addEventListener("keydown", (e) => {
          if (!/^Arrow(Left|Right|Up|Down)$/.test(e.key)) return;
          const botoes = [...grupo.querySelectorAll("[role=radio]")];
          const atual = botoes.findIndex((b) => b.getAttribute("aria-checked") === "true");
          const passo = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
          const prox = botoes[(atual + passo + botoes.length) % botoes.length];
          e.preventDefault();
          definir(chave, prox.dataset.valor);
          prox.focus();
        });
        marcarGrupo(grupo, estado[chave]);
      });

      input.addEventListener("input", () => {
        estado.nome = input.value.slice(0, 22);
        montarTela();
        atualizarCta();
      });

      logoInput.addEventListener("change", () => {
        const arq = logoInput.files && logoInput.files[0];
        if (!arq || !arq.type.startsWith("image/")) return;
        if (estado.logo) URL.revokeObjectURL(estado.logo);
        estado.logo = URL.createObjectURL(arq);
        logoRotulo.textContent = "Logo na tela. Toque pra trocar";
        indice = 0;
        montarTela();
      });

      // links dos cartões de produto: já chegam no simulador com o formato certo
      document.querySelectorAll("[data-simular]").forEach((a) => {
        a.addEventListener("click", () => {
          definir("formato", a.dataset.simular);
          if (a.dataset.ambiente) definir("amb", a.dataset.ambiente);
        });
      });

      // a tela roda sozinha enquanto o simulador está à vista
      let visivel = false;
      if (!reduzido) {
        setInterval(() => {
          if (!visivel || document.hidden) return;
          const filhos = tela.children;
          if (filhos.length < 2) return;
          filhos[indice].classList.remove("ativo");
          indice = (indice + 1) % filhos.length;
          filhos[indice].classList.add("ativo");
        }, 2800);
      }
      if ("IntersectionObserver" in window) {
        new IntersectionObserver((entradas) => {
          entradas.forEach((en) => {
            visivel = en.isIntersecting;
            // perto de aparecer: baixa as outras fotos, pra troca não piscar
            if (en.isIntersecting) cena.querySelectorAll(".sim__foto[data-src]:not([src])").forEach((img) => { img.src = img.dataset.src; });
          });
        }, { rootMargin: "300px 0px" }).observe(cena);
      } else { visivel = true; }

      // profundidade: fundo e aparelho andam em sentidos opostos
      if (mouseFino && !reduzido) {
        cena.addEventListener("pointermove", (e) => {
          const r = cena.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          cena.style.setProperty("--fx", (x * -18).toFixed(1) + "px");
          cena.style.setProperty("--fy", (y * -12).toFixed(1) + "px");
          cena.style.setProperty("--ax", (x * 10).toFixed(1) + "px");
          cena.style.setProperty("--ay", (y * 6).toFixed(1) + "px");
        });
        cena.addEventListener("pointerleave", () => { ["--fx", "--fy", "--ax", "--ay"].forEach((v) => cena.style.setProperty(v, "0px")); });
      }

      montarTela();
      atualizarCta();
    }
  }

  /* ------------------------------------------------------------------ *
   * 7. CARTAZ x TELA: a linha arrasta pelo range (mouse, toque e teclado).
   *    O cartaz é sempre do mês passado: ele está sempre vencido.
   * ------------------------------------------------------------------ */
  {
    const cortina = document.querySelector("[data-cortina]");
    if (cortina) {
      const range = cortina.querySelector("[data-cortina-range]");
      const pos = (v) => cortina.style.setProperty("--pos", v + "%");
      range.addEventListener("input", () => pos(range.value));

      const hoje = new Date();
      const fimPassado = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
      const mes = fimPassado.toLocaleDateString("pt-BR", { month: "long" });
      const q = (s) => cortina.querySelector(s);
      q("[data-mes-passado]").textContent = mes;
      q("[data-fim-mes-passado]").textContent = fimPassado.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      // o cartaz diz "válido até" o mês passado; a tela diz a hora de agora
      const marcarAgora = () => {
        q("[data-hoje]").textContent = "hoje, " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Fortaleza" });
      };
      marcarAgora();
      setInterval(marcarAgora, 15000);

      // a tela troca de anúncio sozinha enquanto está à vista, com as
      // barrinhas de story marcando o tempo de cada um
      const anuncios = [...cortina.querySelectorAll(".tp")];
      const barras = [...cortina.querySelectorAll(".tela-parede__barras i")];
      const DUR = 2800;
      cortina.style.setProperty("--dur", DUR + "ms");
      let atual = 0, aVista = false;
      const mostrar = (n) => {
        anuncios[atual].classList.remove("ativo");
        atual = n;
        anuncios[atual].classList.add("ativo");
        barras.forEach((b, k) => { b.classList.toggle("cheia", k < atual); b.classList.remove("corre"); });
        if (!reduzido && barras[atual]) { void barras[atual].offsetWidth; barras[atual].classList.add("corre"); }
      };
      mostrar(0);
      if (!reduzido) {
        if ("IntersectionObserver" in window) {
          new IntersectionObserver((en) => { aVista = en[0].isIntersecting; }, { threshold: 0.2 }).observe(cortina);
        } else aVista = true;
        setInterval(() => { if (aVista && !document.hidden) mostrar((atual + 1) % anuncios.length); }, DUR);
      }

      // um empurrãozinho quando aparece, pra mostrar que a linha mexe
      if (!reduzido && "IntersectionObserver" in window) {
        const io = new IntersectionObserver((entradas) => {
          if (!entradas[0].isIntersecting) return;
          io.disconnect();
          const roteiro = [[0, 50], [500, 30], [1100, 70], [1600, 50]];
          const t0 = performance.now();
          let tocou = false;
          range.addEventListener("pointerdown", () => { tocou = true; }, { once: true });
          const passo = (t) => {
            if (tocou) return;
            const dt = t - t0;
            let k = 1;
            while (k < roteiro.length - 1 && dt > roteiro[k][0]) k++;
            const [ta, va] = roteiro[k - 1], [tb, vb] = roteiro[k];
            const f = Math.min(1, Math.max(0, (dt - ta) / (tb - ta)));
            const suave = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
            const v = va + (vb - va) * suave;
            pos(v.toFixed(1));
            range.value = v;
            if (dt < roteiro[roteiro.length - 1][0]) requestAnimationFrame(passo);
          };
          setTimeout(() => requestAnimationFrame(passo), 350);
        }, { threshold: 0.6 });
        io.observe(cortina);
      }
    }
  }

  /* ------------------------------------------------------------------ *
   * 8. COMO FUNCIONA: a linha acende conforme a página desce
   * ------------------------------------------------------------------ */
  {
    const lista = document.querySelector("[data-passos]");
    if (lista && !reduzido) {
      const passos = [...lista.children];
      let pedido = false;
      const atualizar = () => {
        pedido = false;
        const r = lista.getBoundingClientRect();
        let p = (window.innerHeight * 0.65 - r.top) / r.height;
        p = p < 0 ? 0 : p > 1 ? 1 : p;
        lista.style.setProperty("--avanco", p.toFixed(3));
        passos.forEach((li, i) => li.classList.toggle("aceso", p >= i / (passos.length - 1) - 0.02));
      };
      window.addEventListener("scroll", () => { if (!pedido) { pedido = true; requestAnimationFrame(atualizar); } }, { passive: true });
      window.addEventListener("resize", atualizar);
      atualizar();
    } else if (lista) {
      [...lista.children].forEach((li) => li.classList.add("aceso"));
    }
  }

  /* ------------------------------------------------------------------ *
   * 9. Ano no rodapé
   * ------------------------------------------------------------------ */
  {
    const ano = document.querySelector("[data-ano]");
    if (ano) ano.textContent = new Date().getFullYear();
  }
})();
