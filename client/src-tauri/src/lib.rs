use once_cell::sync::Lazy;
use pyo3::prelude::*;
use pyo3::types::PyDict;
use serde_json::json;
use serde_json::Value;
use std::env;
use std::fs;
use std::path::PathBuf;
use tauri::async_runtime;
use tauri::{AppHandle, Manager};
use tauri_plugin_deep_link::DeepLinkExt;
use tokio::sync::Mutex;

// NEW: Global state to hold the model path. This allows the `connect` function
// to set the path, and other functions like `llm_sign_typed_message` to read it later.
static MODEL_PATH: Lazy<Mutex<Option<String>>> = Lazy::new(|| Mutex::new(None));

/// Setup embedded Python environment before calling PyO3
fn setup_python_env() {
    let exe_dir = std::env::current_exe()
        .unwrap()
        .parent()
        .unwrap()
        .to_path_buf();

    #[cfg(target_os = "windows")]
    let py_dir = exe_dir.join("python-runtime").join("windows");
    #[cfg(target_os = "linux")]
    let py_dir = exe_dir.join("python-runtime").join("linux");
    #[cfg(target_os = "macos")]
    let py_dir = exe_dir.join("python-runtime").join("macos");

    env::set_var("PYTHONHOME", &py_dir);

    let client_dir = exe_dir.join("python_client");
    let sys_path = format!("{};{}", py_dir.display(), client_dir.display());
    env::set_var("PYTHONPATH", sys_path);
}

/// Helper to call a Python function with kwargs and return JSON
fn call_python_func(func: &str, kwargs: Vec<(&str, Value)>) -> Result<Value, String> {
    setup_python_env();

    Python::with_gil(|py| {
        let client = py.import("client").map_err(|e| e.to_string())?;
        let func_obj = client.getattr(func).map_err(|e| e.to_string())?;

        // Convert kwargs into Python dict
        let dict = PyDict::new(py);
        for (k, v) in kwargs {
            let py_val = serde_json::to_string(&v).unwrap();
            let json = py.import("json").unwrap();
            let loaded = json
                .call_method1("loads", (py_val,))
                .map_err(|e| e.to_string())?;
            dict.set_item(k, loaded).map_err(|e| e.to_string())?;
        }

        let res = func_obj.call((), Some(&dict)).map_err(|e| e.to_string())?;

        let json = py.import("json").unwrap();
        let dumped = json
            .call_method1("dumps", (res,))
            .map_err(|e| e.to_string())?;
        let s: String = dumped.extract().map_err(|e| e.to_string())?;
        serde_json::from_str(&s).map_err(|e| e.to_string())
    })
}

// === Commands translated from client.py ===

// MODIFIED: This command now accepts `model_path` to store it for later use.
#[tauri::command]
async fn connect(model_path: String) -> Result<Value, String> {
    // Store the model path in the global state
    let mut path_guard = MODEL_PATH.lock().await;
    *path_guard = Some(model_path);
    drop(path_guard); // Release the lock

    // The original logic of the connect function remains
    async_runtime::spawn_blocking(|| call_python_func("connect", vec![]))
        .await
        .map_err(|e| e.to_string())?
}

#[tauri::command]
async fn disconnect_usb() -> Result<Value, String> {
    async_runtime::spawn_blocking(|| call_python_func("disconnect_usb", vec![]))
        .await
        .map_err(|e| e.to_string())?
}

#[tauri::command]
async fn is_wallet_exists() -> Result<Value, String> {
    async_runtime::spawn_blocking(|| call_python_func("is_wallet_exists", vec![]))
        .await
        .map_err(|e| e.to_string())?
}

#[tauri::command]
async fn init_wallet(
    pin: String,
    name: Option<String>,
    new_wallet: Option<bool>,
) -> Result<Value, String> {
    async_runtime::spawn_blocking(move || {
        let mut args = vec![("pin", Value::String(pin))];
        if let Some(n) = name {
            args.push(("name", Value::String(n)));
        }
        if let Some(nw) = new_wallet {
            args.push(("new_wallet", Value::Bool(nw)));
        }
        call_python_func("init_wallet", args)
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
async fn get_wallet_name() -> Result<Value, String> {
    async_runtime::spawn_blocking(|| call_python_func("get_wallet_name", vec![]))
        .await
        .map_err(|e| e.to_string())?
}

#[tauri::command]
async fn get_public_key(role: Option<String>) -> Result<Value, String> {
    async_runtime::spawn_blocking(move || {
        let mut args = vec![];
        if let Some(r) = role {
            args.push(("role", Value::String(r)));
        }
        call_python_func("get_public_key", args)
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
async fn sign_personal_message(
    pin: String,
    message: String,
    role: Option<String>,
    transaction_id: Option<String>,
) -> Result<Value, String> {
    async_runtime::spawn_blocking(move || {
        let mut args = vec![
            ("pin", Value::String(pin)),
            ("message", Value::String(message)),
        ];
        if let Some(r) = role {
            args.push(("role", Value::String(r)));
        }
        if let Some(tid) = transaction_id {
            args.push(("transaction_id", Value::String(tid)));
        }
        call_python_func("sign_personal_message", args)
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
async fn sign_typed_message(
    pin: String,
    domain: Value,
    types: Value,
    primary_type: String,
    message: Value,
    role: Option<String>,
    transaction_id: Option<String>,
) -> Result<Value, String> {
    async_runtime::spawn_blocking(move || {
        let mut args = vec![
            ("pin", Value::String(pin)),
            ("domain", domain),
            ("types", types),
            ("primary_type", Value::String(primary_type)),
            ("message", message),
        ];
        if let Some(r) = role {
            args.push(("role", Value::String(r)));
        }
        if let Some(tid) = transaction_id {
            args.push(("transaction_id", Value::String(tid)));
        }
        call_python_func("sign_typed_data", args)
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
async fn confirm_transaction(
    pin: String,
    transaction_id: String,
    transaction_hash: String,
    nonce: u64,
) -> Result<Value, String> {
    async_runtime::spawn_blocking(move || {
        call_python_func(
            "confirm_transaction",
            vec![
                ("pin", Value::String(pin)),
                ("transaction_id", Value::String(transaction_id)),
                ("transaction_hash", Value::String(transaction_hash)),
                ("nonce", Value::Number(nonce.into())),
            ],
        )
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
async fn fail_transaction(transaction_id: String) -> Result<Value, String> {
    async_runtime::spawn_blocking(move || {
        call_python_func(
            "fail_transaction",
            vec![("transaction_id", Value::String(transaction_id))],
        )
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
async fn get_transaction(transaction_id: String) -> Result<Value, String> {
    async_runtime::spawn_blocking(move || {
        call_python_func(
            "get_transaction",
            vec![("transaction_id", Value::String(transaction_id))],
        )
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
async fn get_all_transactions() -> Result<Value, String> {
    async_runtime::spawn_blocking(|| call_python_func("get_all_transactions", vec![]))
        .await
        .map_err(|e| e.to_string())?
}

#[tauri::command]
async fn get_file(filename: String, file_save_location: String) -> Result<Value, String> {
    let full_path = PathBuf::from(&file_save_location).join(&filename);

    if full_path.exists() {
        println!("File already exists: {:?}", full_path);
        return Ok(json!({
            "status": "exists",
            "message": "File already exists. Skipping Python call.",
            "path": full_path.to_str()
        }));
    }

    async_runtime::spawn_blocking(move || {
        call_python_func(
            "get_file",
            vec![
                ("filename", Value::String(filename)),
                ("file_save_location", Value::String(file_save_location)),
            ],
        )
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
async fn get_llm_response(
    model_path: String,
    user_prompt: String,
    system_prompt: String,
    is_chat: bool,
) -> Result<Value, String> {
    async_runtime::spawn_blocking(move || {
        let args = vec![
            ("model_path", Value::String(model_path)),
            ("user_prompt", Value::String(user_prompt)),
            ("system_prompt", Value::String(system_prompt)),
            ("is_chat", Value::Bool(is_chat)),
        ];
        call_python_func("generate_response", args)
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
async fn llm_sign_typed_message(
    pin: String,
    domain: Option<serde_json::Value>,
    types: Option<serde_json::Value>,
    primary_type: String,
    message: Option<serde_json::Value>,
    transaction_id: String,
    user_prompt: String,
) -> Result<Value, String> {
 
    let model_path_guard = MODEL_PATH.lock().await;
    let model_path = model_path_guard
        .as_ref()
        .cloned()
        .ok_or_else(|| "Model path not set. Please call connect() first.".to_string())?;
    drop(model_path_guard);

    let mut llm_response = get_llm_response(model_path, user_prompt, "".to_string(), false).await?;

    let decision = llm_response
        .get("decision")
        .and_then(|d| d.as_bool())
        .ok_or_else(|| "LLM response is missing a valid 'decision' boolean field.".to_string())?;

    if !decision {
        return Ok(llm_response);
    }

    let domain = domain.ok_or_else(|| "'domain' is required when LLM decision is true.".to_string())?;
    let types = types.ok_or_else(|| "'types' is required when LLM decision is true.".to_string())?;
    let message = message.ok_or_else(|| "'message' is required when LLM decision is true.".to_string())?;

    let sign_response = sign_typed_message(
        pin,
        domain,
        types,
        primary_type,
        message,
        Some("LLM".to_string()),
        Some(transaction_id),
    )
    .await?;

    // 6. Combine the LLM response and the signing response into a single object.
    let llm_map = llm_response
        .as_object_mut()
        .ok_or_else(|| "Internal error: LLM response is not a JSON object.".to_string())?;

    if let Some(sign_map) = sign_response.as_object() {
        llm_map.extend(sign_map.clone());
    }

    Ok(llm_response)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, args, cwd| {
            let _ = app
                .get_webview_window("main")
                .expect("no main window")
                .set_focus();
        }))
        .plugin(tauri_plugin_deep_link::init())
        .setup(|app| {
            match app.path().app_data_dir() {
                Ok(app_data_dir) => {
                    if !app_data_dir.exists() {
                        println!("Creating app data dir at {:?}", app_data_dir);
                        fs::create_dir_all(&app_data_dir).map_err(|e| e.to_string())?;
                    }
                }
                Err(e) => {
                    eprintln!("Failed to get app data dir: {}", e);
                }
            }

            #[cfg(desktop)]
            app.deep_link().register("bubbl")?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            connect,
            disconnect_usb,
            is_wallet_exists,
            init_wallet,
            get_wallet_name,
            get_public_key,
            sign_personal_message,
            sign_typed_message,
            confirm_transaction,
            fail_transaction,
            get_transaction,
            get_all_transactions,
            get_file,
            get_llm_response,
            llm_sign_typed_message,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}