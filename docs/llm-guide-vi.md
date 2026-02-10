# Huong dan cau hinh LLM cho GovSense

> Tai lieu huong dan day du ve cac mo hinh AI duoc su dung trong GovSense,
> cach lay API Key, cau hinh, va toi uu chi phi bang cach tu host model tren server.

---

## Muc luc

1. [Tong quan kien truc AI](#1-tong-quan-kien-truc-ai)
2. [LLM cho Chat & Agent](#2-llm-cho-chat--agent)
3. [LLM cho Tom tat Tai lieu](#3-llm-cho-tom-tat-tai-lieu)
4. [Sinh hinh anh (Image Generation)](#4-sinh-hinh-anh-image-generation)
5. [Embedding Model (Tim kiem ngu nghia)](#5-embedding-model-tim-kiem-ngu-nghia)
6. [Reranker (Xep hang ket qua)](#6-reranker-xep-hang-ket-qua)
7. [TTS - Text-to-Speech (Doc van ban)](#7-tts---text-to-speech-doc-van-ban)
8. [STT - Speech-to-Text (Nhan dang giong noi)](#8-stt---speech-to-text-nhan-dang-giong-noi)
9. [Cau hinh global_llm_config.yaml](#9-cau-hinh-global_llm_configyaml)
10. [So sanh LLM: Chon model nao?](#10-so-sanh-llm-chon-model-nao)
11. [Huong dan lay API Key tung nha cung cap](#11-huong-dan-lay-api-key-tung-nha-cung-cap)
12. [Tu host model tren server (Ollama)](#12-tu-host-model-tren-server-ollama)
13. [Tu host model tren server (vLLM)](#13-tu-host-model-tren-server-vllm)
14. [Xu ly su co](#14-xu-ly-su-co)

---

## 1. Tong quan kien truc AI

GovSense su dung **7 loai mo hinh AI** khac nhau, moi loai phuc vu mot muc dich cu the:

```
                        GovSense AI Architecture
 ┌─────────────────────────────────────────────────────────────┐
 │                                                             │
 │  [1] Chat LLM ──────── Tra loi cau hoi, suy luan, agent    │
 │  [2] Summary LLM ───── Tom tat tai lieu khi upload          │
 │  [3] Image Gen ──────── Tao hinh anh tu mo ta              │
 │  [4] Embedding ──────── Chuyen van ban → vector (tim kiem)  │
 │  [5] Reranker ───────── Xep hang lai ket qua tim kiem      │
 │  [6] TTS ────────────── Doc van ban thanh giong noi         │
 │  [7] STT ────────────── Chuyen giong noi thanh van ban     │
 │                                                             │
 └─────────────────────────────────────────────────────────────┘
```

### He thong ID cau hinh

| ID | Loai | Mo ta |
|----|------|-------|
| `0` | Auto Mode | Tu dong can bang tai giua cac model (khuyen nghi) |
| `< 0` (-1, -2, ...) | Global Config | Cau hinh chung tu file YAML, chia se cho tat ca user |
| `> 0` (1, 2, ...) | User Config | Cau hinh rieng do user tao trong giao dien |

### Vai tro LLM (LLM Roles)

Moi **Search Space** (khong gian lam viec) co the gan model khac nhau cho tung vai tro:

| Vai tro | Truong DB | Muc dich |
|---------|-----------|----------|
| **Agent** | `agent_llm_id` | Chat, hoi dap, suy luan |
| **Document Summary** | `document_summary_llm_id` | Tom tat tai lieu khi upload |
| **Image Generation** | `image_generation_config_id` | Tao hinh anh |

---

## 2. LLM cho Chat & Agent

Day la mo hinh **quan trong nhat** - xu ly tat ca cuoc hoi thoai, tim kiem knowledge base, tao podcast, scrape web, v.v.

### Yeu cau

- Ho tro **function calling / tool use** (de su dung cac cong cu nhu search, scrape, image gen)
- Context window lon (toi thieu 8K, khuyen nghi 32K+)
- Ho tro tieng Viet tot

### Model khuyen nghi

| Model | Provider | Gia | Diem manh | Khuyen nghi |
|-------|----------|-----|-----------|-------------|
| **GPT-4o** | OpenAI | $2.50/1M input, $10/1M output | Tot nhat cho tool use, da ngon ngu | San xuat (co ngan sach) |
| **GPT-4o-mini** | OpenAI | $0.15/1M input, $0.60/1M output | Re, nhanh, tool use tot | San xuat (tiet kiem) |
| **Claude 3.5 Sonnet** | Anthropic | $3/1M input, $15/1M output | Suy luan sau, code tot | San xuat (chat nang) |
| **Gemini 2.0 Flash** | Google | $0.10/1M input, $0.40/1M output | Cuc re, nhanh, 1M context | Tiet kiem chi phi |
| **DeepSeek V3** | DeepSeek | $0.27/1M input, $1.10/1M output | Re, manh, ho tro tieng Viet | San xuat (gia tot) |
| **Qwen 2.5 72B** | Alibaba | $0.35/1M input, $1.20/1M output | Tot cho tieng Viet/Trung | Tu host duoc |
| **Llama 3.3 70B** | Meta (Groq) | Mien phi (Groq free tier) | Nhanh nhat, mien phi | Dev/test |

### Cau hinh trong YAML

```yaml
global_llm_configs:
  - id: -1
    name: "GPT-4o Mini"
    provider: "OPENAI"
    model_name: "gpt-4o-mini"
    api_key: "sk-..."
    api_base: ""
    rpm: 500
    tpm: 200000
    litellm_params:
      temperature: 0.7
      max_tokens: 4000
    system_instructions: ""
    use_default_system_instructions: true
    citations_enabled: true
```

---

## 3. LLM cho Tom tat Tai lieu

Khi ban upload tai lieu (PDF, web, file), GovSense dung LLM nay de tao tom tat. Co the dung model khac voi Chat LLM.

### Yeu cau

- Context window **lon** (tai lieu dai)
- Kha nang tom tat tot
- KHONG can function calling

### Model khuyen nghi

| Model | Provider | Diem manh | Khuyen nghi |
|-------|----------|-----------|-------------|
| **Gemini 2.0 Flash** | Google | 1M token context, cuc re | Tot nhat cho tom tat |
| **GPT-4o-mini** | OpenAI | 128K context, re | An toan, on dinh |
| **DeepSeek V3** | DeepSeek | 128K context, re | Gia tot |
| **Qwen 2.5 72B** | Alibaba | 128K context | Tu host duoc |

### Meo: Dung model re cho tom tat

Tom tat tai lieu la tac vu don gian hon chat. Ban co the:
- Dung **GPT-4o** cho Chat (suy luan tot)
- Dung **GPT-4o-mini** hoac **Gemini Flash** cho Document Summary (re hon 10-20x)

---

## 4. Sinh hinh anh (Image Generation)

Tao hinh anh tu mo ta van ban, duoc su dung trong chat khi user yeu cau.

### Provider duoc ho tro

| Provider | Model | Gia/anh | Diem manh |
|----------|-------|---------|-----------|
| **OpenAI** | `dall-e-3` | ~$0.04-0.12 | Chat luong cao, hieu prompt tot |
| **OpenAI** | `gpt-image-1` | ~$0.01-0.02 | Re hon, nhanh |
| **Azure OpenAI** | `azure/dall-e-3` | Tuong tu OpenAI | Cho doanh nghiep |
| **Google** | Vertex AI | Thay doi | Tich hop Google Cloud |

### Cau hinh trong YAML

```yaml
global_image_generation_configs:
  - id: -1
    name: "DALL-E 3"
    provider: "OPENAI"
    model_name: "dall-e-3"
    api_key: "sk-..."
    rpm: 50
    litellm_params: {}
```

---

## 5. Embedding Model (Tim kiem ngu nghia)

Chuyen van ban thanh vector so de tim kiem ngu nghia (semantic search) trong knowledge base. Day la **xu ly local**, KHONG goi API.

### Cau hinh trong `.env`

```bash
# Mac dinh - chay local, KHONG can API key
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

### Cac model kha dung

| Model | Kich thuoc | Chieu (dim) | Tieng Viet | Ghi chu |
|-------|-----------|-------------|------------|---------|
| `sentence-transformers/all-MiniLM-L6-v2` | 80MB | 384 | Kha | **Mac dinh**, nhe, nhanh |
| `sentence-transformers/all-mpnet-base-v2` | 420MB | 768 | Tot hon | Chinh xac hon, nang hon |
| `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` | 470MB | 384 | **Rat tot** | Khuyen nghi cho tieng Viet |
| `BAAI/bge-m3` | 2.2GB | 1024 | **Xuat sac** | Tot nhat cho da ngon ngu |
| `openai://text-embedding-3-small` | Cloud | 1536 | Tot | Can API key, co phi |

### Khuyen nghi cho GovSense (tieng Viet)

```bash
# Tot nhat cho da ngon ngu (bao gom tieng Viet)
EMBEDDING_MODEL=sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2

# Hoac neu server manh (RAM 8GB+)
EMBEDDING_MODEL=BAAI/bge-m3
```

> **Luu y:** Thay doi embedding model yeu cau re-index toan bo tai lieu!
> Dimension toi da: 2000 (gioi han cua PGVector)

---

## 6. Reranker (Xep hang ket qua)

Sau khi tim kiem bang embedding, reranker sap xep lai ket qua cho chinh xac hon. **Tuy chon**, mac dinh TAT.

### Cau hinh trong `.env`

```bash
# Bat reranker (mac dinh: FALSE)
RERANKERS_ENABLED=TRUE
RERANKERS_MODEL_NAME=ms-marco-MiniLM-L-12-v2
RERANKERS_MODEL_TYPE=flashrank
```

### Cac loai reranker

| Loai | Model | Local? | Ghi chu |
|------|-------|--------|---------|
| **Flashrank** | `ms-marco-MiniLM-L-12-v2` | Co | Mac dinh, mien phi, chay local |
| **Cohere** | `rerank-english-v3.0` | Khong | Cloud API, chinh xac hon |
| **Pinecone** | Pinecone Reranker | Khong | Cloud API |

### Khuyen nghi

- **Bat dau**: De TAT (`RERANKERS_ENABLED=FALSE`) de don gian
- **Khi can chinh xac hon**: Bat Flashrank (mien phi, chay local)
- **Production lon**: Dung Cohere Reranker (chinh xac nhat)

---

## 7. TTS - Text-to-Speech (Doc van ban)

Su dung cho tinh nang **Podcast** - chuyen tai lieu thanh audio.

### Cau hinh trong `.env`

```bash
# Mac dinh: Kokoro TTS (chay local, mien phi)
TTS_SERVICE=local/kokoro

# Hoac dung OpenAI TTS (co phi)
# TTS_SERVICE=openai/tts-1
# TTS_SERVICE_API_KEY=sk-...
```

### So sanh

| Service | Gia | Chat luong | Ngon ngu | Ghi chu |
|---------|-----|-----------|----------|---------|
| **local/kokoro** | Mien phi | Tot | EN, ZH, JP, ES, FR, IT, PT, HI | Mac dinh, chay local |
| **openai/tts-1** | $15/1M ky tu | Rat tot | Da ngon ngu | Can API key |
| **openai/tts-1-hd** | $30/1M ky tu | Xuat sac | Da ngon ngu | Chat luong cao |

### Giong noi Kokoro

| Giong | ID | Ngon ngu |
|-------|----|----------|
| Heart (nu) | `af_heart` | Tieng Anh (My) |
| Adam (nam) | `am_adam` | Tieng Anh (My) |
| Bella (nu) | `af_bella` | Tieng Anh (My) |

> **Luu y:** Kokoro hien chua ho tro tieng Viet. Neu can TTS tieng Viet, dung OpenAI hoac Google Cloud TTS.

---

## 8. STT - Speech-to-Text (Nhan dang giong noi)

Su dung cho tinh nang nhap lieu bang giong noi trong chat.

### Cau hinh trong `.env`

```bash
# Mac dinh: Faster-Whisper (chay local, mien phi)
STT_SERVICE=local/base

# Cac model size:
# local/tiny    - Nho nhat, nhanh nhat
# local/base    - Can bang (mac dinh)
# local/small   - Chinh xac hon
# local/medium  - Chat luong cao
# local/large-v3 - Tot nhat (can nhieu RAM)

# Hoac dung OpenAI Whisper API (co phi)
# STT_SERVICE=openai/whisper-1
# STT_SERVICE_API_KEY=sk-...
```

### So sanh

| Service | Gia | Tieng Viet | RAM can | Ghi chu |
|---------|-----|-----------|---------|---------|
| **local/tiny** | Mien phi | Kha | ~1GB | Nhanh, it chinh xac |
| **local/base** | Mien phi | Tot | ~1.5GB | Mac dinh |
| **local/small** | Mien phi | Tot | ~2GB | Khuyen nghi |
| **local/medium** | Mien phi | Rat tot | ~5GB | Can nhieu RAM |
| **local/large-v3** | Mien phi | Xuat sac | ~10GB | Tot nhat |
| **openai/whisper-1** | $0.006/phut | Xuat sac | 0 | Cloud, khong can RAM |

---

## 9. Cau hinh global_llm_config.yaml

Day la file cau hinh trung tam cho toan bo he thong. Dat tai:
`govsense_backend/app/config/global_llm_config.yaml`

### Vi du cau hinh hoan chinh (production)

```yaml
# === Router Settings ===
router_settings:
  routing_strategy: "usage-based-routing"
  num_retries: 3
  allowed_fails: 3
  cooldown_time: 60

# === LLM Configs ===
global_llm_configs:
  # Model chinh cho Chat - GPT-4o Mini (re, nhanh, tool use tot)
  - id: -1
    name: "GPT-4o Mini"
    description: "Model chinh cho chat va agent"
    provider: "OPENAI"
    model_name: "gpt-4o-mini"
    api_key: "sk-proj-..."
    api_base: ""
    rpm: 500
    tpm: 200000
    litellm_params:
      temperature: 0.7
      max_tokens: 4000
    system_instructions: ""
    use_default_system_instructions: true
    citations_enabled: true

  # Model du phong - Gemini Flash (cuc re)
  - id: -2
    name: "Gemini 2.0 Flash"
    description: "Model du phong, cuc re"
    provider: "GOOGLE"
    model_name: "gemini/gemini-2.0-flash"
    api_key: "AIza..."
    api_base: ""
    rpm: 1000
    tpm: 1000000
    litellm_params:
      temperature: 0.7
      max_tokens: 8000
    system_instructions: ""
    use_default_system_instructions: true
    citations_enabled: true

  # Model self-hosted - Ollama (mien phi)
  - id: -3
    name: "Qwen 2.5 32B (Local)"
    description: "Model tu host tren server, mien phi"
    provider: "OLLAMA"
    model_name: "ollama/qwen2.5:32b"
    api_key: ""
    api_base: "http://localhost:11434"
    rpm: 10
    tpm: 50000
    litellm_params:
      temperature: 0.7
      max_tokens: 4000
    system_instructions: ""
    use_default_system_instructions: true
    citations_enabled: true

# === Image Generation Configs ===
image_generation_router_settings:
  routing_strategy: "usage-based-routing"
  num_retries: 3
  allowed_fails: 3
  cooldown_time: 60

global_image_generation_configs:
  - id: -1
    name: "DALL-E 3"
    description: "OpenAI DALL-E 3"
    provider: "OPENAI"
    model_name: "dall-e-3"
    api_key: "sk-proj-..."
    rpm: 50
    litellm_params: {}
```

### Tao file cau hinh

```bash
# Tren server, copy example va chinh sua
cd /opt/govsense/govsense_backend/app/config/
cp global_llm_config.example.yaml global_llm_config.yaml
nano global_llm_config.yaml
# Thay API key va cau hinh theo nhu cau
```

---

## 10. So sanh LLM: Chon model nao?

### Theo ngan sach

| Ngan sach | Chat LLM | Summary LLM | Image Gen | Chi phi/thang (uoc tinh) |
|-----------|----------|-------------|-----------|--------------------------|
| **Mien phi** | Ollama (Qwen 2.5) | Ollama (Qwen 2.5) | Khong co | $0 (can server GPU) |
| **Tiet kiem** | GPT-4o-mini | Gemini Flash | Khong co | ~$5-20 |
| **Can bang** | GPT-4o-mini | Gemini Flash | DALL-E 3 | ~$20-50 |
| **Chat luong** | GPT-4o | GPT-4o-mini | DALL-E 3 | ~$50-200 |
| **Cao cap** | Claude 3.5 Sonnet | GPT-4o | gpt-image-1 | ~$100-500 |

### Theo truong hop su dung

| Truong hop | Model khuyen nghi | Ly do |
|------------|-------------------|-------|
| Co quan nho, it nguoi dung | GPT-4o-mini + Gemini Flash | Re, du manh |
| Co quan lon, nhieu tai lieu | GPT-4o + Ollama local | Can bang chi phi va chat luong |
| Bao mat cao, khong internet | Ollama (Qwen 2.5 72B) | Toan bo du lieu o local |
| Can tieng Viet tot nhat | GPT-4o hoac Gemini | Ho tro tieng Viet tot nhat |
| Test/phat trien | Groq (Llama 3.3) | Mien phi, nhanh |

---

## 11. Huong dan lay API Key tung nha cung cap

### OpenAI (GPT-4o, GPT-4o-mini, DALL-E)

1. Truy cap [platform.openai.com](https://platform.openai.com/)
2. Dang ky / Dang nhap
3. Vao **Settings** > **API Keys** > **Create new secret key**
4. Nap tien tai **Settings** > **Billing** (toi thieu $5)
5. API Key co dang: `sk-proj-...`

```yaml
provider: "OPENAI"
model_name: "gpt-4o-mini"
api_key: "sk-proj-..."
api_base: ""  # De trong
```

### Anthropic (Claude)

1. Truy cap [console.anthropic.com](https://console.anthropic.com/)
2. Dang ky / Dang nhap
3. Vao **API Keys** > **Create Key**
4. Nap tien tai **Plans & Billing**
5. API Key co dang: `sk-ant-...`

```yaml
provider: "ANTHROPIC"
model_name: "claude-sonnet-4-20250514"
api_key: "sk-ant-..."
api_base: ""
```

### Google AI (Gemini)

1. Truy cap [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Dang nhap bang Google account
3. Click **Create API Key**
4. API Key co dang: `AIza...`
5. **Mien phi** 15 request/phut cho Gemini Flash

```yaml
provider: "GOOGLE"
model_name: "gemini/gemini-2.0-flash"
api_key: "AIza..."
api_base: ""
```

### DeepSeek

1. Truy cap [platform.deepseek.com](https://platform.deepseek.com/)
2. Dang ky / Dang nhap
3. Vao **API Keys** > **Create New API Key**
4. Nap tien (chap nhan Visa/Mastercard)
5. API Key co dang: `sk-...`

```yaml
provider: "DEEPSEEK"
model_name: "deepseek-chat"
api_key: "sk-..."
api_base: "https://api.deepseek.com/v1"
```

### Groq (Llama 3.3 - Mien phi)

1. Truy cap [console.groq.com](https://console.groq.com/)
2. Dang ky / Dang nhap (mien phi)
3. Vao **API Keys** > **Create API Key**
4. API Key co dang: `gsk_...`
5. Free tier: 30 request/phut

```yaml
provider: "GROQ"
model_name: "llama-3.3-70b-versatile"
api_key: "gsk_..."
api_base: ""
```

### OpenRouter (Trung gian - nhieu model)

1. Truy cap [openrouter.ai](https://openrouter.ai/)
2. Dang ky / Dang nhap
3. Vao **Keys** > **Create Key**
4. Nap tien tai **Credits**
5. API Key co dang: `sk-or-...`
6. Truy cap 200+ model tu nhieu nha cung cap

```yaml
provider: "OPENROUTER"
model_name: "openrouter/google/gemini-2.0-flash-001"
api_key: "sk-or-..."
api_base: ""
```

### Azure OpenAI (Doanh nghiep)

1. Truy cap [portal.azure.com](https://portal.azure.com/)
2. Tao tai nguyen **Azure OpenAI**
3. Deploy model trong **Azure AI Studio**
4. Lay API Key va Endpoint
5. **Luu y**: Can dung `base_model` trong litellm_params

```yaml
provider: "AZURE"
model_name: "azure/gpt-4o-deployment-name"
api_key: "your-azure-key"
api_base: "https://your-resource.openai.azure.com"
api_version: "2024-02-15-preview"
litellm_params:
  base_model: "gpt-4o"
```

---

## 12. Tu host model tren server (Ollama)

Cach tot nhat de **tiet kiem chi phi** va **bao mat du lieu** - chay model AI ngay tren server cua ban.

### Yeu cau phan cung

| Model | VRAM (GPU) | RAM (CPU) | Disk | Ghi chu |
|-------|-----------|-----------|------|---------|
| Qwen 2.5 7B | 6GB | 8GB | 5GB | Nhe, nhanh |
| Qwen 2.5 14B | 10GB | 16GB | 10GB | Can bang |
| Qwen 2.5 32B | 20GB | 32GB | 20GB | **Khuyen nghi** cho production |
| Qwen 2.5 72B | 40GB+ | 64GB | 45GB | Manh nhat, can GPU tot |
| Llama 3.3 70B | 40GB+ | 64GB | 45GB | Tuong duong 72B |

> **Luu y:** Co the chay tren CPU (khong can GPU) nhung se **cham hon 5-10x**.
> Khuyen nghi: GPU NVIDIA voi toi thieu 16GB VRAM cho model 14B-32B.

### Buoc 1: Cai dat Ollama

```bash
# Cai Ollama tren Ubuntu
curl -fsSL https://ollama.com/install.sh | sh

# Kiem tra
ollama --version

# Ollama se chay o cong 11434 mac dinh
```

### Buoc 2: Tai model

```bash
# Model nho - phu hop server yeu (8GB RAM)
ollama pull qwen2.5:7b

# Model vua - can bang chat luong/toc do (16GB RAM)
ollama pull qwen2.5:14b

# Model lon - tot nhat cho production (32GB+ RAM)
ollama pull qwen2.5:32b

# Model sieu lon - can GPU manh (64GB+ RAM)
ollama pull qwen2.5:72b

# Kiem tra model da tai
ollama list

# Test model
ollama run qwen2.5:32b "Xin chao, ban la ai?"
```

### Buoc 3: Cau hinh Ollama cho production

```bash
# Tao file cau hinh systemd
sudo mkdir -p /etc/systemd/system/ollama.service.d/
sudo tee /etc/systemd/system/ollama.service.d/override.conf << 'EOF'
[Service]
# Cho phep ket noi tu Docker container
Environment="OLLAMA_HOST=0.0.0.0"
# Gioi han so model load dong thoi
Environment="OLLAMA_MAX_LOADED_MODELS=1"
# Thoi gian giu model trong RAM (5 phut)
Environment="OLLAMA_KEEP_ALIVE=5m"
# So thread CPU
Environment="OLLAMA_NUM_THREADS=8"
EOF

# Reload va restart
sudo systemctl daemon-reload
sudo systemctl restart ollama

# Kiem tra trang thai
sudo systemctl status ollama
```

### Buoc 4: Cau hinh GovSense ket noi Ollama

Trong `global_llm_config.yaml`:

```yaml
global_llm_configs:
  - id: -1
    name: "Qwen 2.5 32B (Local)"
    description: "Model chay local tren server - mien phi"
    provider: "OLLAMA"
    model_name: "ollama/qwen2.5:32b"
    api_key: ""
    api_base: "http://host.docker.internal:11434"  # Neu GovSense chay trong Docker
    # api_base: "http://localhost:11434"            # Neu GovSense chay truc tiep
    rpm: 10
    tpm: 50000
    litellm_params:
      temperature: 0.7
      max_tokens: 4000
      num_ctx: 32768      # Context window
    system_instructions: ""
    use_default_system_instructions: true
    citations_enabled: true
```

> **Quan trong:** Khi GovSense chay trong Docker, dung `host.docker.internal` thay vi `localhost`.
> Tren Linux, them `extra_hosts` vao docker-compose:

```yaml
# Them vao service backend trong docker-compose.prod.yml
services:
  backend:
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

### Buoc 5: Kiem tra ket noi

```bash
# Test Ollama API truc tiep
curl http://localhost:11434/api/tags

# Test tu trong Docker container
docker compose -f docker-compose.prod.yml exec backend \
  curl http://host.docker.internal:11434/api/tags

# Test qua LiteLLM
docker compose -f docker-compose.prod.yml exec backend \
  python -c "
from litellm import completion
resp = completion(
    model='ollama/qwen2.5:32b',
    messages=[{'role':'user','content':'Xin chao'}],
    api_base='http://host.docker.internal:11434'
)
print(resp.choices[0].message.content)
"
```

---

## 13. Tu host model tren server (vLLM)

**vLLM** cho hieu nang tot hon Ollama (nhanh 2-3x) nhung cau hinh phuc tap hon. Phu hop cho production lon.

### Yeu cau

- GPU NVIDIA voi CUDA 12+
- VRAM: toi thieu 16GB cho model 14B
- Python 3.10+

### Cai dat

```bash
# Cai vLLM
pip install vllm

# Chay server voi Qwen 2.5 32B
python -m vllm.entrypoints.openai.api_server \
  --model Qwen/Qwen2.5-32B-Instruct \
  --max-model-len 32768 \
  --gpu-memory-utilization 0.9 \
  --host 0.0.0.0 \
  --port 8080

# Hoac dung Docker
docker run -d \
  --gpus all \
  -p 8080:8000 \
  --name vllm \
  vllm/vllm-openai:latest \
  --model Qwen/Qwen2.5-32B-Instruct \
  --max-model-len 32768
```

### Cau hinh GovSense voi vLLM

```yaml
global_llm_configs:
  - id: -1
    name: "Qwen 2.5 32B (vLLM)"
    provider: "OPENAI"          # vLLM tuong thich OpenAI API
    model_name: "Qwen/Qwen2.5-32B-Instruct"
    api_key: "not-needed"       # vLLM khong can key
    api_base: "http://host.docker.internal:8080/v1"
    rpm: 30
    tpm: 100000
    litellm_params:
      temperature: 0.7
      max_tokens: 4000
    system_instructions: ""
    use_default_system_instructions: true
    citations_enabled: true
```

---

## 14. Xu ly su co

### LLM khong tra loi / loi timeout

```bash
# Kiem tra logs
docker compose -f docker-compose.prod.yml logs backend --tail=100 | grep -i "error\|timeout\|llm"

# Nguyen nhan pho bien:
# 1. API key sai hoac het han
# 2. Het credit/quota
# 3. Model name sai
# 4. api_base sai (dac biet voi Ollama/vLLM)
```

### Embedding model khong load duoc

```bash
# Kiem tra tu trong container
docker compose -f docker-compose.prod.yml exec backend \
  python -c "from app.config import config; print('Embedding OK:', config.EMBEDDING_MODEL)"

# Neu loi, thu tai lai model:
docker compose -f docker-compose.prod.yml exec backend \
  python -c "
from chonkie import AutoEmbeddings
emb = AutoEmbeddings.get_embeddings('sentence-transformers/all-MiniLM-L6-v2')
print('Dimension:', emb.dimension)
"
```

### Ollama khong ket noi duoc tu Docker

```bash
# Kiem tra Ollama dang chay
sudo systemctl status ollama

# Kiem tra Ollama lang nghe 0.0.0.0
ss -tlnp | grep 11434
# Phai la: 0.0.0.0:11434 (khong phai 127.0.0.1:11434)

# Neu van la 127.0.0.1, sua cau hinh:
sudo tee /etc/systemd/system/ollama.service.d/override.conf << 'EOF'
[Service]
Environment="OLLAMA_HOST=0.0.0.0"
EOF
sudo systemctl daemon-reload
sudo systemctl restart ollama

# Test tu Docker
docker compose -f docker-compose.prod.yml exec backend \
  curl http://host.docker.internal:11434/api/tags
```

### Tom tat tai lieu that bai (IN_PROGRESS mai)

```bash
# Kiem tra:
# 1. document_summary_llm_id co duoc gan khong?
# 2. Model co dang hoat dong khong?
# 3. API key con credit khong?

# Xem task dang chay
docker compose -f docker-compose.prod.yml exec backend \
  celery -A app.celery_app inspect active

# Xem logs celery worker
docker compose -f docker-compose.prod.yml logs backend | grep -i "celery\|summary\|document"
```

---

## Bang tom tat cau hinh

| Thanh phan | Bien moi truong | Gia tri mac dinh | Local? | Ghi chu |
|------------|----------------|------------------|--------|---------|
| Chat LLM | `global_llm_config.yaml` | Auto (ID 0) | Tuy chon | Quan trong nhat |
| Summary LLM | `global_llm_config.yaml` | Auto (ID 0) | Tuy chon | Co the dung model re |
| Image Gen | `global_llm_config.yaml` | Khong co | Khong | Can API key |
| Embedding | `EMBEDDING_MODEL` | `all-MiniLM-L6-v2` | **Co** | Luon chay local |
| Reranker | `RERANKERS_ENABLED` | `FALSE` | **Co** | Tuy chon |
| TTS | `TTS_SERVICE` | `local/kokoro` | **Co** | Mien phi |
| STT | `STT_SERVICE` | `local/base` | **Co** | Mien phi |

> **Ket luan:** Voi cau hinh mac dinh, ban chi can **1 API key** (OpenAI hoac Google)
> cho Chat LLM. Moi thu khac deu co the chay local mien phi.
