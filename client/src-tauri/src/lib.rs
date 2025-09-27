use reqwest;
use rand::Rng;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::State;
use tauri::{AppHandle, Manager};
use tauri_plugin_deep_link::DeepLinkExt;

// HTTP Client wrapper
pub struct ApiClient {
    client: reqwest::Client,
    base_url: String,
}

impl ApiClient {
    pub fn new() -> Self {
        Self {
            client: reqwest::Client::new(),
            base_url: "http://localhost:8000".to_string(),
        }
    }
}

// Tauri commands
#[tauri::command]
async fn is_wallet_exists(api_client: State<'_, ApiClient>) -> Result<serde_json::Value, String> {
    let url = format!("{}/is_wallet_exists", api_client.base_url);

    let response = api_client
        .client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    response
        .json::<serde_json::Value>()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))
}

#[tauri::command]
async fn init_wallet(
    pin: String,
    name: String,
    new_wallet: Option<bool>,
    api_client: State<'_, ApiClient>,
) -> Result<serde_json::Value, String> {
    let url = format!("{}/init_wallet", api_client.base_url);

    let payload = serde_json::json!({
        "pin": pin,
        "name": name,
        "new_wallet": new_wallet.unwrap_or(true)
    });

    let response = api_client
        .client
        .post(&url)
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    response
        .json::<serde_json::Value>()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))
}

#[tauri::command]
async fn get_wallet_name(api_client: State<'_, ApiClient>) -> Result<serde_json::Value, String> {
    let url = format!("{}/get_wallet_name", api_client.base_url);

    let response = api_client
        .client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    response
        .json::<serde_json::Value>()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))
}

#[tauri::command]
async fn get_public_key(
    role: String,
    api_client: State<'_, ApiClient>,
) -> Result<serde_json::Value, String> {
    let url = format!("{}/public_key/{}", api_client.base_url, role);

    let response = api_client
        .client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    response
        .json::<serde_json::Value>()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))
}

#[tauri::command]
async fn sign_personal_message(
    pin: String,
    message: String,
    role: Option<String>,
    transaction_id: Option<String>,
    api_client: State<'_, ApiClient>,
) -> Result<serde_json::Value, String> {
    let url = format!("{}/sign_personal_message", api_client.base_url);

    let mut payload = serde_json::json!({
        "pin": pin,
        "message": message
    });

    if let Some(r) = role {
        payload["role"] = serde_json::Value::String(r);
    }

    if let Some(tid) = transaction_id {
        payload["transaction_id"] = serde_json::Value::String(tid);
    }

    let response = api_client
        .client
        .post(&url)
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    response
        .json::<serde_json::Value>()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))
}

#[tauri::command]
async fn sign_typed_message(
    pin: String,
    domain: Option<serde_json::Value>,
    types: Option<serde_json::Value>,
    primary_type: String,
    message: Option<serde_json::Value>,
    role: Option<String>,
    transaction_id: Option<String>,
    api_client: State<'_, ApiClient>,
) -> Result<serde_json::Value, String> {
    let url = format!("{}/sign_typed_message", api_client.base_url);

    let mut payload = serde_json::json!({
        "pin": pin,
        "primary_type": primary_type
    });

    if let Some(d) = domain {
        payload["domain"] = d;
    }

    if let Some(t) = types {
        payload["types"] = t;
    }

    if let Some(m) = message {
        payload["message"] = m;
    }

    if let Some(r) = role {
        payload["role"] = serde_json::Value::String(r);
    }

    if let Some(tid) = transaction_id {
        payload["transaction_id"] = serde_json::Value::String(tid);
    }

    let response = api_client
        .client
        .post(&url)
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    response
        .json::<serde_json::Value>()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))
}

#[tauri::command]
async fn confirm_transaction(
    pin: String,
    transaction_id: String,
    transaction_hash: Option<String>,
    nonce: Option<u64>,
    api_client: State<'_, ApiClient>,
) -> Result<serde_json::Value, String> {
    let url = format!(
        "{}/confirm_transaction/{}",
        api_client.base_url, transaction_id
    );

    let mut payload = serde_json::json!({
        "pin": pin
    });

    if let Some(hash) = transaction_hash {
        payload["transaction_hash"] = serde_json::Value::String(hash);
    }

    if let Some(n) = nonce {
        payload["nonce"] = serde_json::Value::Number(serde_json::Number::from(n));
    }

    let response = api_client
        .client
        .post(&url)
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    response
        .json::<serde_json::Value>()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))
}

#[tauri::command]
async fn fail_transaction(
    transaction_id: String,
    api_client: State<'_, ApiClient>,
) -> Result<serde_json::Value, String> {
    let url = format!(
        "{}/fail_transaction/{}",
        api_client.base_url, transaction_id
    );

    let response = api_client
        .client
        .post(&url)
        .json(&serde_json::json!({}))
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    response
        .json::<serde_json::Value>()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))
}

#[tauri::command]
async fn get_transaction(
    transaction_id: String,
    api_client: State<'_, ApiClient>,
) -> Result<serde_json::Value, String> {
    let url = format!("{}/get_transaction/{}", api_client.base_url, transaction_id);

    let response = api_client
        .client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    response
        .json::<serde_json::Value>()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))
}

#[tauri::command]
async fn get_all_transactions(
    api_client: State<'_, ApiClient>,
) -> Result<serde_json::Value, String> {
    let url = format!("{}/get_all_transactions", api_client.base_url);

    let response = api_client
        .client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    response
        .json::<serde_json::Value>()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))
}

#[tauri::command]
async fn llm_sign_personal_message(
    pin: String,
    message: String,
    transaction_id: String,
    api_client: State<'_, ApiClient>,
) -> Result<serde_json::Value, String> {
    // Call the main sign_personal_message function with role set to "LLM"
    sign_personal_message(
        pin,
        message,
        Some("LLM".to_string()),
        Some(transaction_id),
        api_client,
    )
    .await
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
    api_client: State<'_, ApiClient>,
) -> Result<serde_json::Value, String> {
    // --- FIX: Isolate the non-Send variable in its own scope ---
    let (decision, confidence_score, security_score) = {
        let mut rng = rand::thread_rng();
        let decision: bool = rng.gen();
        let confidence_score: u8 = rng.gen_range(0..=100);
        let security_score: u8 = rng.gen_range(0..=100);
        (decision, confidence_score, security_score)
    }; // `rng` is dropped here, before any .await is called

    if decision {
        // Now it's safe to await, as `rng` no longer exists.
        let sign_result = sign_typed_message(
            pin,
            domain,
            types,
            primary_type,
            message,
            Some("LLM".to_string()),
            Some(transaction_id),
            api_client,
        )
        .await;

        // Check if the call was successful
        match sign_result {
            Ok(mut value) => {
                // Ensure the result is a JSON object to merge our keys
                if let Some(obj) = value.as_object_mut() {
                    obj.insert("decision".to_string(), serde_json::json!(true));
                    obj.insert(
                        "reasoning".to_string(),
                        serde_json::json!("Placeholder for reasoning text."),
                    );
                    obj.insert(
                        "confidence_score".to_string(),
                        serde_json::json!(confidence_score),
                    );
                    obj.insert("security_score".to_string(), serde_json::json!(security_score));
                    Ok(serde_json::json!(obj))
                } else {
                    Err(
                        "Internal Error: sign_typed_message did not return a valid JSON object."
                            .to_string(),
                    )
                }
            }
            Err(e) => Err(e), // Propagate the error from the original function
        }
    } else {
        // If decision is false, do not call the function and return the new format
        let response = serde_json::json!({
            "decision": false,
            "reasoning": "Placeholder for reasoning text.",
            "confidence_score": confidence_score,
            "security_score": security_score
        });
        Ok(response)
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, args, cwd| {
            let _ = app.get_webview_window("main")
                       .expect("no main window")
                       .set_focus();
        }))
        .plugin(tauri_plugin_deep_link::init())
        .setup(|app| {
            #[cfg(desktop)]
            app.deep_link().register("bubbl")?;
            Ok(())
        })
        .manage(ApiClient::new())
        .invoke_handler(tauri::generate_handler![
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
            llm_sign_personal_message,
            llm_sign_typed_message
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
