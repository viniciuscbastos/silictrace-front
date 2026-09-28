import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Server, 
  Trash2, 
  RefreshCw, 
  PlusCircle, 
  AlertTriangle 
} from 'lucide-react';
import './App.css';

// URL base da API Flask em execução local
const API_BASE_URL = 'http://127.0.0.1:5000';

export default function App() {
  // Estados para lista de ativos, loading e mensagens de erro da API
  const [ativos, setAtivos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mensagemErro, setMensagemErro] = useState('');

  // Estado do formulário de cadastro
  const [novoAtivo, setNovoAtivo] = useState({
    tag_patrimonio: '',
    categoria: 'Workstation',
    fabricante: 'AMD',
    cpu: '',
    gpu: '',
    memoria_ram: 32,
    armazenamento_primario: '',
    versao_bios: '',
    versao_microcodigo: ''
  });

  // Busca a lista atualizada de ativos no back-end (GET /ativos)
  const carregarAtivos = async () => {
    try {
      setCarregando(true);
      setMensagemErro('');
      const resposta = await fetch(`${API_BASE_URL}/ativos`);
      if (!resposta.ok) throw new Error('Falha ao comunicar com o servidor da API.');
      const dados = await resposta.json();
      setAtivos(dados.ativos || []);
    } catch (err) {
      setMensagemErro('Não foi possível carregar os ativos. Certifique-se de que a API está a correr na porta 5000.');
    } finally {
      setCarregando(false);
    }
  };

  // Carrega os ativos assim que a página é aberta
  useEffect(() => {
    carregarAtivos();
  }, []);

  // Cadastra um novo equipamento e dispara a auditoria inicial (POST /ativo)
  const handleCriarAtivo = async (e) => {
    e.preventDefault();
    try {
      setMensagemErro('');
      const formData = new FormData();
      formData.append('tag_patrimonio', novoAtivo.tag_patrimonio);
      formData.append('categoria', novoAtivo.categoria);
      formData.append('fabricante', novoAtivo.fabricante);
      formData.append('cpu', novoAtivo.cpu);
      formData.append('gpu', novoAtivo.gpu);
      formData.append('memoria_ram', String(novoAtivo.memoria_ram));
      formData.append('armazenamento_primario', novoAtivo.armazenamento_primario);
      formData.append('versao_bios', novoAtivo.versao_bios);
      formData.append('versao_microcodigo', novoAtivo.versao_microcodigo);

      const resposta = await fetch(`${API_BASE_URL}/ativo`, {
        method: 'POST',
        body: formData
      });

      if (!resposta.ok) {
        const erroJson = await resposta.json();
        const detalhe = erroJson.message || erroJson.mensagem || (Array.isArray(erroJson) ? erroJson[0]?.msg : 'Falha ao registar o ativo.');
        throw new Error(detalhe);
      }

      // Reseta os campos do formulário após o sucesso
      setNovoAtivo({
        tag_patrimonio: '',
        categoria: 'Workstation',
        fabricante: 'AMD',
        cpu: '',
        gpu: '',
        memoria_ram: 32,
        armazenamento_primario: '',
        versao_bios: '',
        versao_microcodigo: ''
      });
      await carregarAtivos();
    } catch (err) {
      setMensagemErro(err.message);
    }
  };

  // Atualiza a versão do microcódigo e limpa os registros de CVE (PUT /ativo)
  const handleAtualizarMicrocodigo = async (tag, fabricanteAtual) => {
    const rotulo = fabricanteAtual === 'AMD' ? 'AGESA' : 'Microcódigo MCU';
    const novaVersao = prompt(`Indique a nova versão de ${rotulo} para o ativo ${tag}:`);
    if (!novaVersao) return;

    try {
      setMensagemErro('');
      const formData = new FormData();
      formData.append('tag_patrimonio', tag);
      formData.append('nova_versao_microcodigo', novaVersao);

      const resposta = await fetch(`${API_BASE_URL}/ativo`, {
        method: 'PUT',
        body: formData
      });

      if (!resposta.ok) throw new Error('Falha ao atualizar o firmware.');
      await carregarAtivos();
    } catch (err) {
      setMensagemErro(err.message);
    }
  };

  // Exclui o ativo e suas auditorias vinculadas (DELETE /ativo)
  const handleDeletarAtivo = async (tag) => {
    if (!confirm(`Confirma a remoção definitiva do ativo ${tag}?`)) return;

    try {
      setMensagemErro('');
      const resposta = await fetch(`${API_BASE_URL}/ativo?tag_patrimonio=${encodeURIComponent(tag)}`, {
        method: 'DELETE'
      });

      if (!resposta.ok) throw new Error('Falha ao deletar o ativo.');
      await carregarAtivos();
    } catch (err) {
      setMensagemErro(err.message);
    }
  };

  return (
    <div className="container">
      {/* Topo da aplicação */}
      <header className="header">
        <div className="brand">
          <Server size={32} color="#06b6d4" />
          <div>
            <h1>SilicTrace</h1>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Plataforma de Inventário de Hardware e Auditoria de Firmware
            </span>
          </div>
        </div>
        <span className="brand-badge">MVP 1.1 • PUC-Rio</span>
      </header>

      {/* Alerta de erro */}
      {mensagemErro && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #ef4444',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: '#fca5a5'
        }}>
          <AlertTriangle size={20} />
          <span>{mensagemErro}</span>
        </div>
      )}

      {/* Formulário de cadastro de novo equipamento */}
      <section className="form-card">
        <h2 style={{ fontSize: '1.15rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PlusCircle size={20} color="#06b6d4" />
          Registar Ativo Crítico de Hardware
        </h2>
        <form onSubmit={handleCriarAtivo}>
          <div className="form-grid">
            <div className="form-group">
              <label>Tag de Património</label>
              <input 
                type="text" 
                placeholder="Ex.: SRV-AI-01" 
                required 
                value={novoAtivo.tag_patrimonio}
                onChange={(e) => setNovoAtivo({...novoAtivo, tag_patrimonio: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Categoria</label>
              <select 
                value={novoAtivo.categoria}
                onChange={(e) => setNovoAtivo({...novoAtivo, categoria: e.target.value})}
              >
                <option value="Workstation">Workstation</option>
                <option value="Servidor">Servidor</option>
              </select>
            </div>
            <div className="form-group">
              <label>Arquitetura / Fabricante</label>
              <select 
                value={novoAtivo.fabricante}
                onChange={(e) => setNovoAtivo({...novoAtivo, fabricante: e.target.value})}
              >
                <option value="AMD">AMD</option>
                <option value="Intel">Intel</option>
              </select>
            </div>
            <div className="form-group">
              <label>Processador (CPU)</label>
              <input 
                type="text" 
                placeholder={novoAtivo.fabricante === 'AMD' ? 'Ex.: AMD Ryzen 9 9950X3D' : 'Ex.: Intel Core Ultra 9 285K'} 
                required 
                value={novoAtivo.cpu}
                onChange={(e) => setNovoAtivo({...novoAtivo, cpu: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Placa Gráfica (GPU)</label>
              <input 
                type="text" 
                placeholder="Ex.: NVIDIA GeForce RTX 4090" 
                required 
                value={novoAtivo.gpu}
                onChange={(e) => setNovoAtivo({...novoAtivo, gpu: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Memória RAM (GB)</label>
              <input 
                type="number" 
                min="8" 
                required 
                value={novoAtivo.memoria_ram}
                onChange={(e) => setNovoAtivo({...novoAtivo, memoria_ram: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Armazenamento Primário</label>
              <input 
                type="text" 
                placeholder="Ex.: Samsung 990 PRO 2TB" 
                required 
                value={novoAtivo.armazenamento_primario}
                onChange={(e) => setNovoAtivo({...novoAtivo, armazenamento_primario: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Versão da BIOS (Placa-Mãe)</label>
              <input 
                type="text" 
                placeholder="Ex.: BIOS 1402 ou Dell 2.4.1" 
                required 
                value={novoAtivo.versao_bios}
                onChange={(e) => setNovoAtivo({...novoAtivo, versao_bios: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>{novoAtivo.fabricante === 'AMD' ? 'Microcódigo AMD (AGESA)' : 'Microcódigo Intel (MCU / ME)'}</label>
              <input 
                type="text" 
                placeholder={novoAtivo.fabricante === 'AMD' ? 'Ex.: ComboV2 1.2.0.2' : 'Ex.: MCU 0x12B ou ME 16.1'} 
                required 
                value={novoAtivo.versao_microcodigo}
                onChange={(e) => setNovoAtivo({...novoAtivo, versao_microcodigo: e.target.value})}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">
            Registar Ativo e Efetuar Auditoria de CVE
          </button>
        </form>
      </section>

      {/* Grid de ativos monitorados */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
            Ativos Monitorizados ({ativos.length})
          </h2>
          <button onClick={carregarAtivos} className="btn-action" style={{ maxWidth: '140px' }}>
            <RefreshCw size={14} /> Atualizar Lista
          </button>
        </div>

        {carregando ? (
          <p style={{ color: '#94a3b8' }}>A sincronizar inventário...</p>
        ) : ativos.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>Nenhum ativo registado na infraestrutura.</p>
        ) : (
          <div className="asset-grid">
            {ativos.map((ativo, index) => (
              <div key={ativo.tag_patrimonio || index} className="asset-card">
                <div>
                  <div className="asset-header">
                    <div>
                      <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#38bdf8' }}>
                        {ativo.tag_patrimonio}
                      </span>
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                        ({ativo.categoria} • {ativo.fabricante})
                      </span>
                    </div>

                    {/* Alterna o badge conforme a presença de vulnerabilidades ativas */}
                    {ativo.auditorias && ativo.auditorias.length > 0 ? (
                      <div className="badge-vulnerabilidade-critica" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '4px 10px', borderRadius: '6px' }}>
                        <ShieldAlert size={16} />
                        <span>{ativo.auditorias.length} Vulnerabilidade(s)</span>
                      </div>
                    ) : (
                      <div className="badge-seguro" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '4px 10px', borderRadius: '6px' }}>
                        <ShieldCheck size={16} />
                        <span>0 Vulnerabilidades (Mitigado)</span>
                      </div>
                    )}
                  </div>

                  {/* Especificações técnicas do hardware */}
                  <div className="spec-list">
                    <div className="spec-item">
                      <span className="spec-label">CPU:</span>
                      <span className="spec-val">{ativo.cpu}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">GPU:</span>
                      <span className="spec-val">{ativo.gpu}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">RAM / Armazenamento:</span>
                      <span className="spec-val">{ativo.memoria_ram} GB • {ativo.armazenamento_primario}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">BIOS Placa-Mãe:</span>
                      <span className="spec-val">{ativo.versao_bios}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">{ativo.fabricante === 'AMD' ? 'AGESA:' : 'MCU / ME:'}</span>
                      <span className="spec-val" style={{ color: '#fbbf24' }}>{ativo.versao_microcodigo}</span>
                    </div>
                  </div>

                  {/* Exibição condicional das falhas ou do estado em conformidade */}
                  {ativo.auditorias && ativo.auditorias.length > 0 ? (
                    <div className="cve-section">
                      <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8', marginBottom: '0.35rem' }}>
                        Vulnerabilidades de Firmware (CIRCL API):
                      </div>
                      {ativo.auditorias.map((aud, audIdx) => (
                        <div key={aud.cve_id || audIdx} style={{ fontSize: '0.75rem', marginBottom: '0.4rem', borderLeft: '2px solid #ef4444', paddingLeft: '0.4rem' }}>
                          <span style={{ fontWeight: '700', color: '#f87171' }}>{aud.cve_id}</span>
                          <span style={{ marginLeft: '0.35rem', color: '#f59e0b' }}>
                            [CVSS {aud.cvss_score ? aud.cvss_score : 'N/A'}]
                          </span>
                          <div style={{ color: '#cbd5e1', marginTop: '2px' }}>{aud.descricao}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      marginTop: '0.75rem',
                      padding: '0.6rem 0.75rem',
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px dashed rgba(16, 185, 129, 0.35)',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      color: '#34d399',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <ShieldCheck size={16} color="#34d399" />
                      <span>Microcódigo em conformidade. Nenhuma vulnerabilidade ativa vinculada.</span>
                    </div>
                  )}
                </div>

                {/* Botões de atualização e exclusão */}
                <div className="card-actions">
                  <button 
                    onClick={() => handleAtualizarMicrocodigo(ativo.tag_patrimonio, ativo.fabricante)} 
                    className="btn-action"
                  >
                    <RefreshCw size={14} /> Atualizar Microcódigo
                  </button>
                  <button 
                    onClick={() => handleDeletarAtivo(ativo.tag_patrimonio)} 
                    className="btn-action" 
                    style={{ color: '#f87171' }}
                  >
                    <Trash2 size={14} /> Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}