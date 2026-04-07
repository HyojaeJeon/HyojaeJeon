#pragma once
/**
 * ServiceRegistry — Quy ước đăng ký và tra cứu service
 * ServiceRegistry — 서비스 등록 및 조회 규약
 *
 * Vai trò / 역할:
 *   Đóng vai trò "tủ lưu trữ" chứa tất cả service của ứng dụng.
 *   앱의 모든 서비스를 보관하는 "사물함" 역할을 한다.
 *
 *   Khi khởi động ứng dụng, AppCompositionRoot đăng ký các service vào đây,
 *   và các tầng trên (PosRequestResponder...) lấy service cần thiết ra để dùng.
 *   앱 시작 시 AppCompositionRoot가 서비스를 등록하고,
 *   상위 계층(PosRequestResponder...)이 필요한 서비스를 꺼내서 사용한다.
 *
 * Nguyên tắc thiết kế / 설계 원칙:
 *   - Mỗi tầng chỉ lấy ra service mà nó CẦN
 *     각 계층은 자기가 필요한 서비스만 꺼낸다
 *   - Actions chỉ biết UseCase, không biết Manager
 *     Actions는 UseCase만 알고, Manager는 모른다
 *   - Manager không biết PosRealTimeSender
 *     Manager는 PosRealTimeSender를 모른다
 *
 * Ví dụ / 사용 예:
 *   ServiceRegistry registry;
 *   registry.Register<CreateOrderUseCase>(useCase);       // đăng ký / 등록
 *   auto uc = registry.Resolve<CreateOrderUseCase>();      // lấy ra / 조회
 */

#include <memory>
#include <typeindex>
#include <unordered_map>
#include <stdexcept>
#include <string>

class ServiceRegistry {
public:
    // ──────────────────────────────────────────────────
    // Register — Đăng ký service vào tủ lưu trữ
    // Register — 서비스를 사물함에 등록한다
    //
    // Nhận một shared_ptr và lưu với nhãn kiểu TInterface.
    // shared_ptr를 받아서 TInterface 타입 이름표로 저장한다.
    //
    // Ví dụ / 예시:
    //   registry.Register<CreateOrderUseCase>(ptr);
    // ──────────────────────────────────────────────────
    template <typename TInterface>
    void Register(std::shared_ptr<TInterface> instance) {
        auto key = std::type_index(typeid(TInterface));
        services_[key] = instance;
    }

    // ──────────────────────────────────────────────────
    // Resolve — Lấy service ra từ tủ lưu trữ
    // Resolve — 사물함에서 서비스를 꺼낸다
    //
    // Nếu service chưa được đăng ký → throw runtime_error
    // 등록되지 않은 서비스를 요청하면 → runtime_error 발생
    //
    // Ví dụ / 예시:
    //   auto uc = registry.Resolve<CreateOrderUseCase>();
    // ──────────────────────────────────────────────────
    template <typename TInterface>
    std::shared_ptr<TInterface> Resolve() const {
        auto key = std::type_index(typeid(TInterface));
        auto it = services_.find(key);
        if (it == services_.end()) {
            throw std::runtime_error(
                std::string("ServiceRegistry: service not registered — ") +
                typeid(TInterface).name()
            );
        }
        return std::static_pointer_cast<TInterface>(it->second);
    }

    // ──────────────────────────────────────────────────
    // Has — Kiểm tra service đã được đăng ký chưa
    // Has — 서비스가 등록되어 있는지 확인한다
    // ──────────────────────────────────────────────────
    template <typename TInterface>
    bool Has() const {
        auto key = std::type_index(typeid(TInterface));
        return services_.find(key) != services_.end();
    }

private:
    // Bộ nhớ bên trong: nhãn kiểu (type) → con trỏ đối tượng thực
    // 내부 저장소: 타입 이름표 → 실제 객체 포인터
    std::unordered_map<std::type_index, std::shared_ptr<void>> services_;
};
