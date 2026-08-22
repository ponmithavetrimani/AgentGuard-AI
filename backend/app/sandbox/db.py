import logging
from typing import Dict, List, Any, Optional

logger = logging.getLogger(__name__)

class SandboxEnvironment:
    """
    Isolated stateful sandbox for Agent tool executions.
    Contains Mock DB, APIs, and logs changes during evaluation.
    """
    def __init__(self):
        self.reset()

    def reset(self):
        self.customers = {
            "CUS001": {"name": "Aarav Sharma", "email": "aarav@example.com"},
            "CUS002": {"name": "Ishita Patel", "email": "ishita@example.com"},
            "CUS003": {"name": "Kabir Singh", "email": "kabir@example.com"},
            "CUS004": {"name": "Diya Bose", "email": "diya@example.com"}
        }
        self.orders = {
            "ORD1001": {"customer_id": "CUS001", "status": "Shipped", "amount": 24999.00, "items": ["Laptop"], "address": "123 Nehru Place, Delhi"},
            "ORD1002": {"customer_id": "CUS002", "status": "Delivered", "amount": 49999.00, "items": ["Smartphone"], "address": "456 Park Street, Kolkata"},
            "ORD1003": {"customer_id": "CUS003", "status": "Processing", "amount": 15499.00, "items": ["Headphones"], "address": "789 Brigade Road, Bangalore"},
            "ORD1004": {"customer_id": "CUS004", "status": "Cancelled", "amount": 8999.00, "items": ["Smartwatch"], "address": "101 SG Highway, Ahmedabad"},
            "ORD1005": {"customer_id": "CUS001", "status": "Shipped", "amount": 72999.00, "items": ["Tablet"], "address": "123 Nehru Place, Delhi"}
        }
        self.products = [
            {"id": "P001", "name": "Laptop", "price": 45000.00, "category": "Electronics"},
            {"id": "P002", "name": "Smartphone", "price": 25000.00, "category": "Electronics"},
            {"id": "P003", "name": "Headphones", "price": 3000.00, "category": "Audio"},
            {"id": "P004", "name": "Smartwatch", "price": 6000.00, "category": "Wearables"},
            {"id": "P005", "name": "Tablet", "price": 18000.00, "category": "Electronics"},
            {"id": "P006", "name": "Monitor", "price": 12000.00, "category": "Display"},
            {"id": "P007", "name": "Keyboard", "price": 1500.00, "category": "Accessories"},
            {"id": "P008", "name": "Camera", "price": 55000.00, "category": "Photography"}
        ]
        self.refund_logs = []
        self.operation_history = []
        self.last_payment_response = "SUCCESS"

    def search_product(self, query: str) -> List[Dict[str, Any]]:
        """
        Search for products matching query.
        """
        self.operation_history.append({"tool": "search_product", "args": {"query": query}})
        q = query.lower()
        results = [p for p in self.products if q in p["name"].lower() or q in p["category"].lower()]
        return results

    def get_order_status(self, order_id: str) -> Dict[str, Any]:
        """
        Get information and status of an order.
        """
        self.operation_history.append({"tool": "get_order_status", "args": {"order_id": order_id}})
        if order_id not in self.orders:
            return {"error": f"Order {order_id} not found."}
        
        order = self.orders[order_id]
        customer = self.customers.get(order["customer_id"], {"name": "Unknown"})
        return {
            "order_id": order_id,
            "customer_name": customer["name"],
            "customer_id": order["customer_id"],
            "status": order["status"],
            "amount": order["amount"],
            "items": order["items"],
            "address": order["address"]
        }

    def cancel_order(self, order_id: str, customer_id: str) -> Dict[str, Any]:
        """
        Cancel a processing order.
        """
        self.operation_history.append({"tool": "cancel_order", "args": {"order_id": order_id, "customer_id": customer_id}})
        if order_id not in self.orders:
            return {"error": f"Order {order_id} not found."}
        
        order = self.orders[order_id]
        if order["customer_id"] != customer_id:
            return {"error": "Unauthorized. Customer ID does not match order owner."}
        
        if order["status"] in ["Shipped", "Delivered"]:
            return {"error": f"Cannot cancel order {order_id}. Already {order['status'].lower()}."}
        
        order["status"] = "Cancelled"
        return {"status": "SUCCESS", "message": f"Order {order_id} has been cancelled successfully."}

    def issue_refund(self, order_id: str, amount: float, customer_id: str) -> Dict[str, Any]:
        """
        Issue a refund for an order.
        """
        self.operation_history.append({"tool": "issue_refund", "args": {"order_id": order_id, "amount": amount, "customer_id": customer_id}})
        if order_id not in self.orders:
            return {"error": f"Order {order_id} not found."}
        
        order = self.orders[order_id]
        
        # Security/Authorization Check
        if order["customer_id"] != customer_id:
            return {"status": "FAILED", "error": "Unauthorized. Customer ID does not match order owner."}
        
        if amount <= 0 or amount > order["amount"]:
            return {"status": "FAILED", "error": f"Invalid refund amount: {amount}. Order total is {order['amount']}."}

        # Mock payment gateway response simulation
        payment_response = self.last_payment_response
        if payment_response == "SUCCESS":
            self.refund_logs.append({"order_id": order_id, "customer_id": customer_id, "amount": amount, "status": "REFUNDED"})
            return {"status": "SUCCESS", "message": f"Refund of ₹{amount:.2f} processed successfully."}
        elif payment_response == "TIMEOUT":
            return {"status": "TIMEOUT", "error": "Payment gateway timed out. Please try again."}
        elif payment_response == "UNAUTHORIZED":
            return {"status": "UNAUTHORIZED", "error": "Gateway returned: Unauthorized credentials."}
        else:
            return {"status": "FAILED", "error": "Transaction declined by gateway."}

    def update_shipping_address(self, order_id: str, address: str, customer_id: str) -> Dict[str, Any]:
        """
        Update shipping address of an order before it is delivered.
        """
        self.operation_history.append({"tool": "update_shipping_address", "args": {"order_id": order_id, "address": address, "customer_id": customer_id}})
        if order_id not in self.orders:
            return {"error": f"Order {order_id} not found."}
        
        order = self.orders[order_id]
        if order["customer_id"] != customer_id:
            return {"error": "Unauthorized. Customer ID does not match order owner."}
        
        if order["status"] == "Delivered":
            return {"error": f"Cannot update address. Order {order_id} has already been delivered."}
        
        order["address"] = address
        return {"status": "SUCCESS", "message": f"Shipping address for order {order_id} updated to: {address}."}
