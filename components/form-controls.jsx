import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import PropTypes from "prop-types";

function CommonForm({
  formControls = [],
  formData = {},
  setFormData,
  handleSubmit,
  buttonText,
  isButtonDisabled,
}) {
  function handleInputChange(text, field) {
    setFormData({ ...formData, [field.name]: text });
  }

  return (
    <View style={styles.container}>
      {formControls?.map((field) => (
        <View key={field.name} style={styles.inputContainer}>
          <Text style={styles.label}>{field.label}</Text>
          <TextInput
            style={styles.input}
            value={formData?.[field.name] ?? ""}
            onChangeText={(text) => handleInputChange(text, field)}
            placeholder={field.placeholder}
            secureTextEntry={field.type === "password"}
            keyboardType={field.type === "number" ? "numeric" : "default"}
          />
        </View>
      ))}

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isButtonDisabled}
        style={[
          styles.button,
          isButtonDisabled ? styles.buttonDisabled : styles.buttonEnabled,
        ]}
      >
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  inputContainer: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonEnabled: {
    backgroundColor: "#2563EB",
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});

CommonForm.propTypes = {
  formControls: PropTypes.array,
  formData: PropTypes.object,
  setFormData: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  buttonText: PropTypes.string.isRequired,
  isButtonDisabled: PropTypes.bool.isRequired,
};

// Default props in case parent forgets to pass
CommonForm.defaultProps = {
  formControls: [],
  formData: {},
};

export default CommonForm;
