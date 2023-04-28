//
//  ViewController.swift
//  Shared (App)
//
//  Created by Albert Chan on 4/15/23.
//

import WebKit

#if os(iOS)
import UIKit
typealias PlatformViewController = UIViewController
#elseif os(macOS)
import Cocoa
import SafariServices
typealias PlatformViewController = NSViewController
#endif

let extensionBundleIdentifier = "AC-Company.ShowDistance.Extension"

class ViewController: PlatformViewController, WKNavigationDelegate, WKScriptMessageHandler {

    @IBOutlet var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()

        self.webView.navigationDelegate = self

#if os(iOS)
        self.webView.scrollView.isScrollEnabled = false
#endif

        self.webView.configuration.userContentController.add(self, name: "controller")

        self.webView.loadFileURL(Bundle.main.url(forResource: "Main", withExtension: "html")!, allowingReadAccessTo: Bundle.main.resourceURL!)
        
        
        //try ChatGPT's suggestion
        // Get the current active Safari page.
        /*
            SFSafariApplication.getActiveWindow { (window) in
                window?.getActiveTab { (tab) in
                    tab?.getActivePage { (page) in
                        // Execute JavaScript code in the context of the current webpage.
                        page?.dispatchMessageToScript(
                            withName: "getSelectedText",
                            userInfo: nil
                        )
                    }
                }
            }
         */
        //try ChatGPT's suggestion
        
    }
    
    //ChatGPT
    // Handle the "getSelectedTextResponse" message from the webpage.
    /*
    func safariExtensionHandler(message: [String : Any]) {
        if let selectedText = message["message"] as? String {
            // Highlight the selected text.
            let highlightScript = "var span = document.createElement('span');span.style.backgroundColor='yellow';span.innerHTML = '\(selectedText)';window.getSelection().getRangeAt(0).surroundContents(span);"
            SFSafariApplication.getActiveWindow { (window) in
                window?.getActiveTab { (tab) in
                    tab?.getActivePage { (page) in
                        page?.dispatchMessageToScript(
                            withName: "highlightSelectedText",
                            userInfo: ["highlightScript": highlightScript]
                        )
                    }
                }
            }
        }
    }
    */
    

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
#if os(iOS)
        webView.evaluateJavaScript("show('ios')")
#elseif os(macOS)
        webView.evaluateJavaScript("show('mac')")

        SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: extensionBundleIdentifier) { (state, error) in
            guard let state = state, error == nil else {
                // Insert code to inform the user that something went wrong.
                return
            }

            DispatchQueue.main.async {
                if #available(macOS 13, *) {
                    webView.evaluateJavaScript("show('mac', \(state.isEnabled), true)")
                } else {
                    webView.evaluateJavaScript("show('mac', \(state.isEnabled), false)")
                }
            }
        }
#endif
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
#if os(macOS)
        if (message.body as! String != "open-preferences") {
            return;
        }

        SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionBundleIdentifier) { error in
            guard error == nil else {
                // Insert code to inform the user that something went wrong.
                return
            }

            DispatchQueue.main.async {
                NSApplication.shared.terminate(nil)
            }
        }
#endif
    }

}
