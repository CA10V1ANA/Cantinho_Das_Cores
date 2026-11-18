import { useState, useEffect } from "react";
import {
  cancelarFala,
  definirNomeVoz,
  definirVelocidadeVoz,
  definirVozAtiva,
  falar,
  listarVozes,
  melhorVoz,
  obterNomeVoz,
} from "./utils/voz";
import { definirEfeitosAtivos } from "./utils/sons";
import {
  gerarDadosExemplo,
  lerHistorico,
  limparHistorico,
  registrarPartida,
} from "./utils/desempenho";
import Fundo from "./components/Fundo";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import JogoCores from "./games/JogoCores";
import JogoEncaixe from "./games/JogoEncaixe";
import JogoLigar from "./games/JogoLigar";
import JogoCorForma from "./games/JogoCorForma";
import JogoFalar from "./games/JogoFalar";
import JogoFrutas from "./games/JogoFrutas";

const JOGOS = [
  {
    id: "cores",
    nome: "Acerte a cor",
    bg: "linear-gradient(160deg,#D2EEFF,#86CCFF)",
    C: JogoCores,
  },
  {
    id: "encaixe",
    nome: "Encaixe as formas",
    bg: "linear-gradient(160deg,#D8F8DF,#86E0A0)",
    C: JogoEncaixe,
  },
  {
    id: "ligar",
    nome: "Ligue ao nome",
    bg: "linear-gradient(160deg,#FFF3C4,#FFD25A)",
    C: JogoLigar,
  },
  {
    id: "corforma",
    nome: "Cor e forma",
    bg: "linear-gradient(160deg,#EEE4FF,#BDA2FF)",
    C: JogoCorForma,
  },
  {
    id: "falar",
    nome: "Vamos falar",
    bg: "linear-gradient(160deg,#FFE5D6,#FFA784)",
    C: JogoFalar,
  },
  {
    id: "frutas",
    nome: "Bloquinho de Frutas",
    sub: "Estilo Dots",
    bg: "linear-gradient(160deg,#FFE2E2,#FF9E99)",
    C: JogoFrutas,
  },
];

function lerStorage(chave, fallback) {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto !== null ? JSON.parse(bruto) : fallback;
  } catch {
    return fallback;
  }
}

function gravarStorage(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // Ignora caso localStorage esteja bloqueado
  }
}

export default function App() {
  const [resp, setResp] = useState(() => lerStorage("cc_resp", ""));
  const [tela, setTela] = useState(() => (lerStorage("cc_resp", "") ? "menu" : "login"));
  const [abaMenu, setAbaMenu] = useState("jogos");
  const [som, setSom] = useState(() => lerStorage("cc_som", true));
  const [efeitos, setEfeitos] = useState(() => lerStorage("cc_efeitos", true));
  const [velocidade, setVelocidade] = useState(() => lerStorage("cc_vel", "calma"));
  const [fonteMaior, setFonteMaior] = useState(() => lerStorage("cc_fonte_maior", false));
  const [altoContraste, setAltoContraste] = useState(() => lerStorage("cc_contraste", false));
  const [calmo, setCalmo] = useState(() => lerStorage("cc_calmo", false));
  const [totalRodadas, setTotalRodadas] = useState(() => lerStorage("cc_total", 5));
  const [idade, setIdade] = useState(() => lerStorage("cc_idade", "8"));
  const [chave, setChave] = useState(0);
  const [feitos, setFeitos] = useState(() => lerStorage("cc_feitos", {}));
  const [historico, setHistorico] = useState(() => lerHistorico());
  const [vozes, setVozes] = useState([]);
  const [vozSel, setVozSel] = useState(() => lerStorage("cc_voz", ""));
  const [depthFisica, setDepthFisica] = useState("3d");
  const [seedFisica, setSeedFisica] = useState(52490);

  useEffect(() => {
    definirVozAtiva(som);
    gravarStorage("cc_som", som);
  }, [som]);

  useEffect(() => {
    definirEfeitosAtivos(efeitos);
    gravarStorage("cc_efeitos", efeitos);
  }, [efeitos]);

  useEffect(() => {
    definirVelocidadeVoz(velocidade);
    gravarStorage("cc_vel", velocidade);
  }, [velocidade]);

  useEffect(() => {
    gravarStorage("cc_fonte_maior", fonteMaior);
  }, [fonteMaior]);

  useEffect(() => {
    gravarStorage("cc_contraste", altoContraste);
  }, [altoContraste]);

  useEffect(() => {
    gravarStorage("cc_calmo", calmo);
  }, [calmo]);

  useEffect(() => {
    gravarStorage("cc_total", totalRodadas);
  }, [totalRodadas]);

  useEffect(() => {
    gravarStorage("cc_idade", idade);
  }, [idade]);

  useEffect(() => {
    if (vozSel) {
      definirNomeVoz(vozSel);
      gravarStorage("cc_voz", vozSel);
    }
  }, [vozSel]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const ler = () => {
      const lista = listarVozes();
      setVozes(lista);
      const salva = lerStorage("cc_voz", "");
      if (salva && lista.some((v) => v.name === salva)) {
        definirNomeVoz(salva);
        setVozSel(salva);
      } else if (!obterNomeVoz() && lista.length) {
        const escolhida = melhorVoz(lista);
        if (escolhida) {
          definirNomeVoz(escolhida.name);
          setVozSel(escolhida.name);
        }
      }
    };
    ler();
    window.speechSynthesis.onvoiceschanged = ler;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const entrar = (email) => {
    setResp(email);
    gravarStorage("cc_resp", email);
    setAbaMenu("jogos");
    setTela("menu");
  };

  const trocarVoz = (nome) => {
    definirNomeVoz(nome);
    setVozSel(nome);
    falar("Oi! Eu vou ajudar você a brincar.");
  };

  const sair = () => {
    cancelarFala();
    setTela("login");
    setResp("");
    gravarStorage("cc_resp", "");
  };

  const selecionarJogo = (id) => {
    cancelarFala();
    setChave((c) => c + 1);
    setTela(id);
  };

  const gravarSessao = (id, resumo, incrementarConcluidos) => {
    const atualizadoHist = registrarPartida({
      id: `sessao-${id}-${chave}`,
      jogoId: id,
      idade,
      ...resumo,
    });
    setHistorico(atualizadoHist);

    if (incrementarConcluidos) {
      setFeitos((f) => {
        const atualizado = { ...f, [id]: (f[id] || 0) + 1 };
        gravarStorage("cc_feitos", atualizado);
        return atualizado;
      });
    }
  };

  const jogo = JOGOS.find((j) => j.id === tela);
  const JogoAtivo = jogo?.C;

  const classesRaiz = [
    "cc",
    fonteMaior ? "fonte-maior" : "",
    altoContraste ? "alto-contraste" : "",
    calmo ? "modo-calmo" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classesRaiz}>
      <Fundo />

      {tela === "login" && (
        <Login
          onEntrar={entrar}
          onVisitante={() => entrar("visitante")}
        />
      )}

      {tela === "menu" && (
        <Menu
          jogos={JOGOS}
          resp={resp}
          som={som}
          onToggleSom={() => setSom((s) => !s)}
          efeitos={efeitos}
          onToggleEfeitos={() => setEfeitos((e) => !e)}
          velocidade={velocidade}
          onToggleVelocidade={() =>
            setVelocidade((v) => (v === "calma" ? "normal" : "calma"))
          }
          fonteMaior={fonteMaior}
          onToggleFonteMaior={() => setFonteMaior((f) => !f)}
          altoContraste={altoContraste}
          onToggleAltoContraste={() => setAltoContraste((a) => !a)}
          calmo={calmo}
          onToggleCalmo={() => setCalmo((c) => !c)}
          totalRodadas={totalRodadas}
          onAlterarTotal={(n) => setTotalRodadas(n)}
          idade={idade}
          onAlterarIdade={(novaIdade) => setIdade(novaIdade)}
          aba={abaMenu}
          onAlterarAba={(novaAba) => {
            cancelarFala();
            setAbaMenu(novaAba);
          }}
          depthFisica={depthFisica}
          onToggleDepthFisica={() =>
            setDepthFisica((d) => (d === "3d" ? "2d" : "3d"))
          }
          seedFisica={seedFisica}
          onReiniciarBloquinhos={() => setSeedFisica((s) => s + 1)}
          historico={historico}
          onCarregarExemplo={() => setHistorico(gerarDadosExemplo())}
          onLimparHistorico={() => setHistorico(limparHistorico())}
          onSair={sair}
          vozes={vozes}
          vozSel={vozSel}
          onTrocarVoz={trocarVoz}
          feitos={feitos}
          onSelecionarJogo={selecionarJogo}
        />
      )}

      {JogoAtivo && (
        <main className="tela">
          <JogoAtivo
            key={`${chave}-${totalRodadas}-${idade}`}
            total={totalRodadas}
            idade={idade}
            calmo={calmo}
            onSair={() => {
              cancelarFala();
              setTela("menu");
            }}
            onNovo={() => {
              cancelarFala();
              setChave((c) => c + 1);
            }}
            onFim={(resumo) => gravarSessao(jogo.id, resumo, true)}
            onParcial={(resumo) => gravarSessao(jogo.id, resumo, false)}
          />
        </main>
      )}
    </div>
  );
}
