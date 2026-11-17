import { useState, useEffect } from "react";
import {
  cancelarFala,
  definirNomeVoz,
  definirVozAtiva,
  falar,
  listarVozes,
  melhorVoz,
  obterNomeVoz,
} from "./utils/voz";
import Fundo from "./components/Fundo";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import JogoCores from "./games/JogoCores";
import JogoEncaixe from "./games/JogoEncaixe";
import JogoLigar from "./games/JogoLigar";
import JogoCorForma from "./games/JogoCorForma";
import JogoFalar from "./games/JogoFalar";

const JOGOS = [
  {
    id: "cores",
    nome: "Acerte a cor",
    ico: "🎨",
    bg: "linear-gradient(160deg,#D2EEFF,#86CCFF)",
    C: JogoCores,
  },
  {
    id: "encaixe",
    nome: "Encaixe as formas",
    ico: "🔷",
    bg: "linear-gradient(160deg,#D8F8DF,#86E0A0)",
    C: JogoEncaixe,
  },
  {
    id: "ligar",
    nome: "Ligue ao nome",
    ico: "🔗",
    bg: "linear-gradient(160deg,#FFF3C4,#FFD25A)",
    C: JogoLigar,
  },
  {
    id: "corforma",
    nome: "Cor e forma",
    ico: "🧩",
    bg: "linear-gradient(160deg,#EEE4FF,#BDA2FF)",
    C: JogoCorForma,
  },
  {
    id: "falar",
    nome: "Vamos falar",
    ico: "🗣️",
    bg: "linear-gradient(160deg,#FFE5D6,#FFA784)",
    C: JogoFalar,
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
  const [som, setSom] = useState(() => lerStorage("cc_som", true));
  const [chave, setChave] = useState(0);
  const [feitos, setFeitos] = useState(() => lerStorage("cc_feitos", {}));
  const [vozes, setVozes] = useState([]);
  const [vozSel, setVozSel] = useState(() => lerStorage("cc_voz", ""));

  useEffect(() => {
    definirVozAtiva(som);
    gravarStorage("cc_som", som);
  }, [som]);

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

  const registrarFim = (id) => {
    setFeitos((f) => {
      const atualizado = { ...f, [id]: (f[id] || 0) + 1 };
      gravarStorage("cc_feitos", atualizado);
      return atualizado;
    });
  };

  const jogo = JOGOS.find((j) => j.id === tela);
  const JogoAtivo = jogo?.C;

  return (
    <div className="cc">
      <Fundo />
      {tela === "login" && <Login onEntrar={entrar} />}
      {tela === "menu" && (
        <Menu
          jogos={JOGOS}
          resp={resp}
          som={som}
          onToggleSom={() => setSom((s) => !s)}
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
            key={chave}
            onSair={() => {
              cancelarFala();
              setTela("menu");
            }}
            onNovo={() => {
              cancelarFala();
              setChave((c) => c + 1);
            }}
            onFim={() => registrarFim(jogo.id)}
          />
        </main>
      )}
    </div>
  );
}
