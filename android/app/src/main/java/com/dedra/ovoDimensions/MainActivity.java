package com.dedra.ovoDimensions;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Disable WebView security restrictions to allow iframe access
        WebView webView = getBridge().getWebView();
        webView.getSettings().setAllowUniversalAccessFromFileURLs(true);
        webView.getSettings().setAllowFileAccessFromFileURLs(true);
        webView.getSettings().setJavaScriptCanOpenWindowsAutomatically(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setAllowContentAccess(true);
        webView.getSettings().setAllowFileAccess(true);
        
        // Disable web security (equivalent to --disable-web-security in Chrome)
        webView.getSettings().setMixedContentMode(android.webkit.WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
    }
}
