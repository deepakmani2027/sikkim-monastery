import requests
import sys
import json
from datetime import datetime

class SikkimMonasteryAPITester:
    def __init__(self, base_url="https://bd6da563-3408-4f06-96b5-a9aa30bf8bef.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response preview: {str(response_data)[:200]}...")
                    return True, response_data
                except:
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, {}

    def test_health(self):
        """Test health endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "api/health",
            200
        )
        return success

    def test_monasteries(self):
        """Test monasteries endpoint"""
        success, response = self.run_test(
            "Get Monasteries",
            "GET",
            "api/monasteries",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} monasteries")
            if len(response) == 6:
                print("✅ Correct number of monasteries (6)")
                return True
            else:
                print(f"⚠️  Expected 6 monasteries, got {len(response)}")
                return False
        return success

    def test_travel_tips(self):
        """Test travel tips endpoint"""
        success, response = self.run_test(
            "Get Travel Tips",
            "GET",
            "api/travel-tips",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} travel tips")
            if len(response) == 6:
                print("✅ Correct number of travel tips (6)")
                return True
            else:
                print(f"⚠️  Expected 6 travel tips, got {len(response)}")
                return False
        return success

    def test_chat(self):
        """Test chat endpoint with Tenzin"""
        chat_data = {
            "messages": [
                {"role": "user", "content": "Hello Tenzin, tell me about Rumtek Monastery"}
            ],
            "speak_mode": False
        }
        
        success, response = self.run_test(
            "Chat with Tenzin",
            "POST",
            "api/chat",
            200,
            data=chat_data,
            timeout=60  # AI responses can take longer
        )
        
        if success and isinstance(response, dict) and 'text' in response:
            print(f"   AI Response: {response['text'][:100]}...")
            return True
        return success

    def test_chat_with_speak_mode(self):
        """Test chat endpoint with speak mode enabled"""
        chat_data = {
            "messages": [
                {"role": "user", "content": "What is the significance of Pemayangtse Monastery?"}
            ],
            "speak_mode": True
        }
        
        success, response = self.run_test(
            "Chat with Speak Mode",
            "POST",
            "api/chat",
            200,
            data=chat_data,
            timeout=60
        )
        
        if success and isinstance(response, dict):
            if 'text' in response:
                print(f"   AI Response: {response['text'][:100]}...")
            if 'audio_url' in response and response['audio_url']:
                print("✅ Audio URL generated for TTS")
            else:
                print("⚠️  No audio URL in response (TTS may have failed)")
            return True
        return success

    def test_anam_session_token(self):
        """Test Anam session token creation"""
        success, response = self.run_test(
            "Create Anam Session Token",
            "POST",
            "api/anam/session-token",
            200,
            timeout=30
        )
        
        if success and isinstance(response, dict) and 'sessionToken' in response:
            print("✅ Session token created successfully")
            return True
        return success

def main():
    print("🏔️  Starting Sikkim Monastery API Tests")
    print("=" * 50)
    
    tester = SikkimMonasteryAPITester()
    
    # Run all tests
    tests = [
        tester.test_health,
        tester.test_monasteries,
        tester.test_travel_tips,
        tester.test_chat,
        tester.test_chat_with_speak_mode,
        tester.test_anam_session_token
    ]
    
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            tester.failed_tests.append({
                "test": test.__name__,
                "error": str(e)
            })
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.failed_tests:
        print("\n❌ Failed Tests:")
        for failure in tester.failed_tests:
            print(f"   - {failure}")
    
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"📈 Success Rate: {success_rate:.1f}%")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())